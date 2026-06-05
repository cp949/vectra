/**
 * motion XY vector kinematics helper(`displacementVector*`, `velocity*`, `position*`) 단위 테스트.
 */

import { describe, expect, test } from 'vitest';
import { displacementVector } from '../../../src/motion/displacement-vector';
import { displacementVectorInto } from '../../../src/motion/displacement-vector-into';
import { position } from '../../../src/motion/position';
import { positionInto } from '../../../src/motion/position-into';
import { velocity } from '../../../src/motion/velocity';
import { velocityInto } from '../../../src/motion/velocity-into';

describe('displacementVectorInto', () => {
  test('component-wise v * t + 0.5 * a * t^2를 out에 기록한다', () => {
    const out = { x: 0, y: 0 };
    const result = displacementVectorInto(out, { x: 2, y: -3 }, { x: 4, y: 6 }, 2);

    expect(result).toBe(out);
    expect(result).toEqual({ x: 12, y: 6 });
  });

  test('tuple input도 같은 값을 기록한다', () => {
    expect(displacementVectorInto({ x: 0, y: 0 }, [2, -3], [4, 6], 2)).toEqual({
      x: 12,
      y: 6,
    });
  });

  test('tuple output에 기록하고 같은 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = displacementVectorInto(out, { x: 2, y: -3 }, { x: 4, y: 6 }, 2);

    expect(result).toBe(out);
    expect(result).toEqual([12, 6]);
  });

  test('object output에 기록하고 같은 object reference를 반환한다', () => {
    const out = { x: 0, y: 0 };
    expect(displacementVectorInto(out, { x: 2, y: -3 }, { x: 4, y: 6 }, 2)).toBe(out);
  });

  test('time < 0은 역방향 closed-form으로 평가한다', () => {
    // x: 2*-1 + 0.5*4*1 = 0, y: -3*-1 + 0.5*6*1 = 6
    expect(displacementVectorInto({ x: 0, y: 0 }, { x: 2, y: -3 }, { x: 4, y: 6 }, -1)).toEqual({ x: 0, y: 6 });
  });

  test('time === 0은 변위 0을 기록한다', () => {
    expect(displacementVectorInto({ x: 0, y: 0 }, { x: 2, y: -3 }, { x: 4, y: 6 }, 0)).toEqual({ x: 0, y: 0 });
  });

  test('out === velocity aliasing에서도 원래 input 값으로 계산한다', () => {
    const shared = { x: 2, y: -3 };
    const result = displacementVectorInto(shared, shared, { x: 4, y: 6 }, 2);

    expect(result).toBe(shared);
    expect(result).toEqual({ x: 12, y: 6 });
  });

  test('out === acceleration aliasing에서도 원래 input 값으로 계산한다', () => {
    const shared = { x: 4, y: 6 };
    const result = displacementVectorInto(shared, { x: 2, y: -3 }, shared, 2);

    expect(result).toBe(shared);
    expect(result).toEqual({ x: 12, y: 6 });
  });

  test.each([
    ['velocity.x', [{ x: Number.NaN, y: 0 }, { x: 0, y: 0 }, 1]],
    ['velocity.x', [{ x: Number.POSITIVE_INFINITY, y: 0 }, { x: 0, y: 0 }, 1]],
    ['velocity.y', [{ x: 0, y: Number.NEGATIVE_INFINITY }, { x: 0, y: 0 }, 1]],
    ['acceleration.x', [{ x: 0, y: 0 }, { x: Number.NaN, y: 0 }, 1]],
    ['acceleration.y', [{ x: 0, y: 0 }, { x: 0, y: Number.POSITIVE_INFINITY }, 1]],
    ['time', [{ x: 0, y: 0 }, { x: 0, y: 0 }, Number.NaN]],
    ['time', [{ x: 0, y: 0 }, { x: 0, y: 0 }, Number.POSITIVE_INFINITY]],
    ['time', [{ x: 0, y: 0 }, { x: 0, y: 0 }, Number.NEGATIVE_INFINITY]],
  ] as const)('%s 위치의 non-finite 입력은 RangeError', (_name, [v, a, t]) => {
    expect(() => displacementVectorInto({ x: 0, y: 0 }, v, a, t)).toThrow(RangeError);
  });

  test('overflow 결과는 RangeError이고 out을 수정하지 않는다', () => {
    const out = { x: 1, y: 2 };
    expect(() =>
      displacementVectorInto(out, { x: Number.MAX_VALUE, y: 0 }, { x: Number.MAX_VALUE, y: 0 }, Number.MAX_VALUE)
    ).toThrow(RangeError);
    expect(out).toEqual({ x: 1, y: 2 });
  });

  test('overflow 시 tuple out도 수정하지 않는다', () => {
    const out: [number, number] = [1, 2];
    expect(() =>
      displacementVectorInto(out, { x: Number.MAX_VALUE, y: 0 }, { x: Number.MAX_VALUE, y: 0 }, Number.MAX_VALUE)
    ).toThrow(RangeError);
    expect(out).toEqual([1, 2]);
  });

  test('signed-zero 결과 component는 0으로 canonicalize한다', () => {
    const result = displacementVectorInto({ x: 0, y: 0 }, { x: -0, y: -0 }, { x: -0, y: -0 }, 1);

    expect(Object.is(result.x, -0)).toBe(false);
    expect(Object.is(result.y, -0)).toBe(false);
  });
});

describe('displacementVector', () => {
  test('새 plain object로 변위 벡터를 반환한다', () => {
    expect(displacementVector({ x: 2, y: -3 }, { x: 4, y: 6 }, 2)).toEqual({
      x: 12,
      y: 6,
    });
  });

  test('tuple input도 같은 값을 반환한다', () => {
    expect(displacementVector([2, -3], [4, 6], 2)).toEqual({ x: 12, y: 6 });
  });

  test('input을 mutate하지 않고 새 object를 반환한다', () => {
    const velocityArg = { x: 2, y: -3 };
    const accelerationArg = { x: 4, y: 6 };
    const result = displacementVector(velocityArg, accelerationArg, 2);

    expect(result).not.toBe(velocityArg);
    expect(result).not.toBe(accelerationArg);
    expect(velocityArg).toEqual({ x: 2, y: -3 });
    expect(accelerationArg).toEqual({ x: 4, y: 6 });
  });

  test('non-finite 입력은 RangeError', () => {
    expect(() => displacementVector({ x: Number.NaN, y: 0 }, { x: 0, y: 0 }, 1)).toThrow(RangeError);
  });

  test('signed-zero 결과 component는 0으로 canonicalize한다', () => {
    const result = displacementVector({ x: -0, y: -0 }, { x: -0, y: -0 }, 1);

    expect(Object.is(result.x, -0)).toBe(false);
    expect(Object.is(result.y, -0)).toBe(false);
  });
});

describe('velocityInto', () => {
  test('component-wise v0 + a * t를 out에 기록한다', () => {
    const out = { x: 0, y: 0 };
    const result = velocityInto(out, { x: 2, y: -3 }, { x: 4, y: 6 }, 2);

    expect(result).toBe(out);
    expect(result).toEqual({ x: 10, y: 9 });
  });

  test('tuple input도 같은 값을 기록한다', () => {
    expect(velocityInto({ x: 0, y: 0 }, [2, -3], [4, 6], 2)).toEqual({
      x: 10,
      y: 9,
    });
  });

  test('tuple output에 기록하고 같은 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = velocityInto(out, { x: 2, y: -3 }, { x: 4, y: 6 }, 2);

    expect(result).toBe(out);
    expect(result).toEqual([10, 9]);
  });

  test('time < 0은 역방향 closed-form으로 평가한다', () => {
    // x: 2 + 4*-1 = -2, y: -3 + 6*-1 = -9
    expect(velocityInto({ x: 0, y: 0 }, { x: 2, y: -3 }, { x: 4, y: 6 }, -1)).toEqual({ x: -2, y: -9 });
  });

  test('time === 0은 초기 속도를 그대로 기록한다', () => {
    expect(velocityInto({ x: 0, y: 0 }, { x: 2, y: -3 }, { x: 4, y: 6 }, 0)).toEqual({ x: 2, y: -3 });
  });

  test('out === initialVelocity aliasing에서도 원래 input 값으로 계산한다', () => {
    const shared = { x: 2, y: -3 };
    const result = velocityInto(shared, shared, { x: 4, y: 6 }, 2);

    expect(result).toBe(shared);
    expect(result).toEqual({ x: 10, y: 9 });
  });

  test('out === acceleration aliasing에서도 원래 input 값으로 계산한다', () => {
    const shared = { x: 4, y: 6 };
    const result = velocityInto(shared, { x: 2, y: -3 }, shared, 2);

    expect(result).toBe(shared);
    expect(result).toEqual({ x: 10, y: 9 });
  });

  test.each([
    ['initialVelocity.x', [{ x: Number.NaN, y: 0 }, { x: 0, y: 0 }, 1]],
    ['initialVelocity.y', [{ x: 0, y: Number.POSITIVE_INFINITY }, { x: 0, y: 0 }, 1]],
    ['acceleration.x', [{ x: 0, y: 0 }, { x: Number.NEGATIVE_INFINITY, y: 0 }, 1]],
    ['acceleration.y', [{ x: 0, y: 0 }, { x: 0, y: Number.NaN }, 1]],
    ['time', [{ x: 0, y: 0 }, { x: 0, y: 0 }, Number.NaN]],
    ['time', [{ x: 0, y: 0 }, { x: 0, y: 0 }, Number.POSITIVE_INFINITY]],
    ['time', [{ x: 0, y: 0 }, { x: 0, y: 0 }, Number.NEGATIVE_INFINITY]],
  ] as const)('%s 위치의 non-finite 입력은 RangeError', (_name, [v0, a, t]) => {
    expect(() => velocityInto({ x: 0, y: 0 }, v0, a, t)).toThrow(RangeError);
  });

  test('overflow 결과는 RangeError이고 out을 수정하지 않는다', () => {
    const out = { x: 1, y: 2 };
    expect(() =>
      velocityInto(out, { x: Number.MAX_VALUE, y: 0 }, { x: Number.MAX_VALUE, y: 0 }, Number.MAX_VALUE)
    ).toThrow(RangeError);
    expect(out).toEqual({ x: 1, y: 2 });
  });

  test('signed-zero 결과 component는 0으로 canonicalize한다', () => {
    const result = velocityInto({ x: 0, y: 0 }, { x: -0, y: -0 }, { x: -0, y: -0 }, 1);

    expect(Object.is(result.x, -0)).toBe(false);
    expect(Object.is(result.y, -0)).toBe(false);
  });
});

describe('velocity', () => {
  test('새 plain object로 속도 벡터를 반환한다', () => {
    expect(velocity({ x: 2, y: -3 }, { x: 4, y: 6 }, 2)).toEqual({
      x: 10,
      y: 9,
    });
  });

  test('tuple input도 같은 값을 반환한다', () => {
    expect(velocity([2, -3], [4, 6], 2)).toEqual({ x: 10, y: 9 });
  });

  test('input을 mutate하지 않고 새 object를 반환한다', () => {
    const initialVelocityArg = { x: 2, y: -3 };
    const accelerationArg = { x: 4, y: 6 };
    const result = velocity(initialVelocityArg, accelerationArg, 2);

    expect(result).not.toBe(initialVelocityArg);
    expect(result).not.toBe(accelerationArg);
    expect(initialVelocityArg).toEqual({ x: 2, y: -3 });
    expect(accelerationArg).toEqual({ x: 4, y: 6 });
  });

  test('non-finite 입력은 RangeError', () => {
    expect(() => velocity({ x: Number.NaN, y: 0 }, { x: 0, y: 0 }, 1)).toThrow(RangeError);
  });

  test('signed-zero 결과 component는 0으로 canonicalize한다', () => {
    const result = velocity({ x: -0, y: -0 }, { x: -0, y: -0 }, 1);

    expect(Object.is(result.x, -0)).toBe(false);
    expect(Object.is(result.y, -0)).toBe(false);
  });
});

describe('positionInto', () => {
  test('component-wise p0 + v0 * t + 0.5 * a * t^2를 out에 기록한다', () => {
    const out = { x: 0, y: 0 };
    const result = positionInto(out, { x: 1, y: 2 }, { x: 2, y: -3 }, { x: 4, y: 6 }, 2);

    expect(result).toBe(out);
    expect(result).toEqual({ x: 13, y: 8 });
  });

  test('tuple input도 같은 값을 기록한다', () => {
    expect(positionInto({ x: 0, y: 0 }, [1, 2], [2, -3], [4, 6], 2)).toEqual({
      x: 13,
      y: 8,
    });
  });

  test('tuple output에 기록하고 같은 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = positionInto(out, { x: 1, y: 2 }, { x: 2, y: -3 }, { x: 4, y: 6 }, 2);

    expect(result).toBe(out);
    expect(result).toEqual([13, 8]);
  });

  test('time < 0은 역방향 closed-form으로 평가한다', () => {
    // x: 1 + 2*-1 + 0.5*4*1 = 1, y: 2 + -3*-1 + 0.5*6*1 = 8
    expect(positionInto({ x: 0, y: 0 }, { x: 1, y: 2 }, { x: 2, y: -3 }, { x: 4, y: 6 }, -1)).toEqual({ x: 1, y: 8 });
  });

  test('time === 0은 초기 위치를 그대로 기록한다', () => {
    expect(positionInto({ x: 0, y: 0 }, { x: 1, y: 2 }, { x: 2, y: -3 }, { x: 4, y: 6 }, 0)).toEqual({ x: 1, y: 2 });
  });

  test('out === initialPosition aliasing에서도 원래 input 값으로 계산한다', () => {
    const shared = { x: 1, y: 2 };
    const result = positionInto(shared, shared, { x: 2, y: -3 }, { x: 4, y: 6 }, 2);

    expect(result).toBe(shared);
    expect(result).toEqual({ x: 13, y: 8 });
  });

  test('out === initialVelocity aliasing에서도 원래 input 값으로 계산한다', () => {
    const shared = { x: 2, y: -3 };
    const result = positionInto(shared, { x: 1, y: 2 }, shared, { x: 4, y: 6 }, 2);

    expect(result).toBe(shared);
    expect(result).toEqual({ x: 13, y: 8 });
  });

  test('out === acceleration aliasing에서도 원래 input 값으로 계산한다', () => {
    const shared = { x: 4, y: 6 };
    const result = positionInto(shared, { x: 1, y: 2 }, { x: 2, y: -3 }, shared, 2);

    expect(result).toBe(shared);
    expect(result).toEqual({ x: 13, y: 8 });
  });

  test.each([
    ['initialPosition.x', [{ x: Number.NaN, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, 1]],
    ['initialPosition.y', [{ x: 0, y: Number.POSITIVE_INFINITY }, { x: 0, y: 0 }, { x: 0, y: 0 }, 1]],
    ['initialVelocity.x', [{ x: 0, y: 0 }, { x: Number.NEGATIVE_INFINITY, y: 0 }, { x: 0, y: 0 }, 1]],
    ['initialVelocity.y', [{ x: 0, y: 0 }, { x: 0, y: Number.NaN }, { x: 0, y: 0 }, 1]],
    ['acceleration.x', [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: Number.NaN, y: 0 }, 1]],
    ['acceleration.y', [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: Number.POSITIVE_INFINITY }, 1]],
    ['time', [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, Number.NaN]],
    ['time', [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, Number.POSITIVE_INFINITY]],
    ['time', [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, Number.NEGATIVE_INFINITY]],
  ] as const)('%s 위치의 non-finite 입력은 RangeError', (_name, [p0, v0, a, t]) => {
    expect(() => positionInto({ x: 0, y: 0 }, p0, v0, a, t)).toThrow(RangeError);
  });

  test('overflow 결과는 RangeError이고 out을 수정하지 않는다', () => {
    const out = { x: 1, y: 2 };
    expect(() =>
      positionInto(
        out,
        { x: Number.MAX_VALUE, y: 0 },
        { x: Number.MAX_VALUE, y: 0 },
        { x: Number.MAX_VALUE, y: 0 },
        Number.MAX_VALUE
      )
    ).toThrow(RangeError);
    expect(out).toEqual({ x: 1, y: 2 });
  });

  test('signed-zero 결과 component는 0으로 canonicalize한다', () => {
    const result = positionInto({ x: 0, y: 0 }, { x: -0, y: -0 }, { x: -0, y: -0 }, { x: -0, y: -0 }, 1);

    expect(Object.is(result.x, -0)).toBe(false);
    expect(Object.is(result.y, -0)).toBe(false);
  });
});

describe('position', () => {
  test('새 plain object로 위치 벡터를 반환한다', () => {
    expect(position({ x: 1, y: 2 }, { x: 2, y: -3 }, { x: 4, y: 6 }, 2)).toEqual({ x: 13, y: 8 });
  });

  test('tuple input도 같은 값을 반환한다', () => {
    expect(position([1, 2], [2, -3], [4, 6], 2)).toEqual({ x: 13, y: 8 });
  });

  test('input을 mutate하지 않고 새 object를 반환한다', () => {
    const initialPositionArg = { x: 1, y: 2 };
    const initialVelocityArg = { x: 2, y: -3 };
    const accelerationArg = { x: 4, y: 6 };
    const result = position(initialPositionArg, initialVelocityArg, accelerationArg, 2);

    expect(result).not.toBe(initialPositionArg);
    expect(result).not.toBe(initialVelocityArg);
    expect(result).not.toBe(accelerationArg);
    expect(initialPositionArg).toEqual({ x: 1, y: 2 });
    expect(initialVelocityArg).toEqual({ x: 2, y: -3 });
    expect(accelerationArg).toEqual({ x: 4, y: 6 });
  });

  test('non-finite 입력은 RangeError', () => {
    expect(() => position({ x: Number.NaN, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, 1)).toThrow(RangeError);
  });

  test('signed-zero 결과 component는 0으로 canonicalize한다', () => {
    const result = position({ x: -0, y: -0 }, { x: -0, y: -0 }, { x: -0, y: -0 }, 1);

    expect(Object.is(result.x, -0)).toBe(false);
    expect(Object.is(result.y, -0)).toBe(false);
  });
});
