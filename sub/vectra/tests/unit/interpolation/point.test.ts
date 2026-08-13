import { describe, expect, expectTypeOf, test } from 'vitest';
import { bilerpPoint } from '../../../src/interpolation/bilerp-point';
import { bilerpPointInto } from '../../../src/interpolation/bilerp-point-into';
import { lerpPoint } from '../../../src/interpolation/lerp-point';
import { lerpPointByElapsed } from '../../../src/interpolation/lerp-point-by-elapsed';
import { lerpPointByElapsedInto } from '../../../src/interpolation/lerp-point-by-elapsed-into';
import { lerpPointInto } from '../../../src/interpolation/lerp-point-into';
import { midpoint } from '../../../src/interpolation/midpoint';
import { midpointInto } from '../../../src/interpolation/midpoint-into';
import { moveTowardPoint } from '../../../src/interpolation/move-toward-point';
import { moveTowardPointInto } from '../../../src/interpolation/move-toward-point-into';

describe('interpolation point 보간 - lerpPointInto', () => {
  const nonFiniteValues = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

  test('t=0에서 a를 반환한다', () => {
    const out = { x: 0, y: 0 };
    const result = lerpPointInto(out, { x: 1, y: 2 }, { x: 5, y: 8 }, 0);
    expect(result).toBe(out);
    expect(out).toEqual({ x: 1, y: 2 });
  });

  test('t=1에서 b를 반환한다', () => {
    const out = { x: 0, y: 0 };
    lerpPointInto(out, { x: 1, y: 2 }, { x: 5, y: 8 }, 1);
    expect(out).toEqual({ x: 5, y: 8 });
  });

  test('t=0.5에서 a와 b의 중점을 반환한다', () => {
    const out = { x: 0, y: 0 };
    lerpPointInto(out, { x: 0, y: 0 }, { x: 4, y: 6 }, 0.5);
    expect(out).toEqual({ x: 2, y: 3 });
  });

  test('t를 clamp하지 않고 extrapolation을 허용한다 (t=2)', () => {
    const out = { x: 0, y: 0 };
    lerpPointInto(out, { x: 0, y: 0 }, { x: 4, y: 6 }, 2);
    expect(out).toEqual({ x: 8, y: 12 });
  });

  test('tuple input을 처리한다', () => {
    const out = { x: 0, y: 0 };
    lerpPointInto(out, [0, 0], [10, 20], 0.5);
    expect(out).toEqual({ x: 5, y: 10 });
  });

  test('mutable tuple out에 결과를 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = lerpPointInto(out, { x: 0, y: 0 }, { x: 4, y: 6 }, 0.5);
    expect(result).toBe(out);
    expect(out[0]).toBe(2);
    expect(out[1]).toBe(3);
    expectTypeOf(result).toEqualTypeOf<[number, number]>();
  });

  test('out === a aliasing에서도 올바른 결과를 반환한다', () => {
    // out과 a가 같은 object일 때 b를 읽기 전에 out을 오염시키면 안 된다
    const pt: { x: number; y: number } = { x: 0, y: 0 };
    lerpPointInto(pt, pt, { x: 4, y: 6 }, 0.5);
    expect(pt).toEqual({ x: 2, y: 3 });
  });

  test('out === b aliasing에서도 올바른 결과를 반환한다', () => {
    const pt: { x: number; y: number } = { x: 4, y: 6 };
    lerpPointInto(pt, { x: 0, y: 0 }, pt, 0.5);
    expect(pt).toEqual({ x: 2, y: 3 });
  });

  test.each(nonFiniteValues)('a의 x/y가 finite하지 않으면 RangeError를 던진다 (%s)', (value) => {
    expect(() => lerpPointInto({ x: 0, y: 0 }, { x: value, y: 0 }, { x: 1, y: 1 }, 0.5)).toThrow(RangeError);
    expect(() => lerpPointInto({ x: 0, y: 0 }, { x: 0, y: value }, { x: 1, y: 1 }, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('b의 x/y가 finite하지 않으면 RangeError를 던진다 (%s)', (value) => {
    expect(() => lerpPointInto({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: value, y: 1 }, 0.5)).toThrow(RangeError);
    expect(() => lerpPointInto({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: value }, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('t가 finite하지 않으면 RangeError를 던진다 (%s)', (value) => {
    expect(() => lerpPointInto({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 1 }, value)).toThrow(RangeError);
  });
});

describe('interpolation point 보간 - lerpPoint', () => {
  test('새 plain object를 반환한다', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 4, y: 6 };
    const result = lerpPoint(a, b, 0.5);
    expect(result).not.toBe(a);
    expect(result).not.toBe(b);
    expect(result).toEqual({ x: 2, y: 3 });
  });
});

describe('interpolation point 보간 - midpointInto', () => {
  test('a와 b의 중점을 out에 기록한다', () => {
    const out = { x: 0, y: 0 };
    const result = midpointInto(out, { x: 0, y: 0 }, { x: 4, y: 6 });
    expect(result).toBe(out);
    expect(out).toEqual({ x: 2, y: 3 });
  });

  test('lerpPoint(a, b, 0.5)와 동일한 결과를 반환한다', () => {
    const a = { x: 1, y: 3 };
    const b = { x: 7, y: 9 };
    const out = { x: 0, y: 0 };
    midpointInto(out, a, b);
    const expected = lerpPoint(a, b, 0.5);
    expect(out.x).toBe(expected.x);
    expect(out.y).toBe(expected.y);
  });

  test('tuple input을 처리한다', () => {
    const out = { x: 0, y: 0 };
    midpointInto(out, [0, 0], [10, 20]);
    expect(out).toEqual({ x: 5, y: 10 });
  });

  test('mutable tuple out에 결과를 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = midpointInto(out, { x: 0, y: 0 }, { x: 4, y: 6 });
    expect(result).toBe(out);
    expect(out[0]).toBe(2);
    expect(out[1]).toBe(3);
  });

  test('out === a aliasing에서도 올바른 결과를 반환한다', () => {
    const pt: { x: number; y: number } = { x: 0, y: 0 };
    midpointInto(pt, pt, { x: 4, y: 6 });
    expect(pt).toEqual({ x: 2, y: 3 });
  });

  test('out === b aliasing에서도 올바른 결과를 반환한다', () => {
    // out과 b가 같은 object일 때 a를 읽기 전에 out을 오염시키면 안 된다
    const pt: { x: number; y: number } = { x: 4, y: 6 };
    midpointInto(pt, { x: 0, y: 0 }, pt);
    expect(pt).toEqual({ x: 2, y: 3 });
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'finite하지 않은 input %s는 RangeError를 던진다',
    (value) => {
      expect(() => midpointInto({ x: 0, y: 0 }, { x: value, y: 0 }, { x: 1, y: 1 })).toThrow(RangeError);
      expect(() => midpointInto({ x: 0, y: 0 }, { x: 0, y: value }, { x: 1, y: 1 })).toThrow(RangeError);
      expect(() => midpointInto({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: value, y: 1 })).toThrow(RangeError);
      expect(() => midpointInto({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: value })).toThrow(RangeError);
    }
  );
});

describe('interpolation point 보간 - midpoint', () => {
  test('중점을 반환한다', () => {
    expect(midpoint({ x: 0, y: 0 }, { x: 4, y: 6 })).toEqual({ x: 2, y: 3 });
  });
});

describe('interpolation point 보간 - moveTowardPointInto', () => {
  test('euclidean distance가 maxDistance 이하이면 target을 반환한다', () => {
    const out = { x: 0, y: 0 };
    // distance = 5 (3-4-5 삼각형), maxDistance = 10 → target 도달
    const result = moveTowardPointInto(out, { x: 0, y: 0 }, { x: 3, y: 4 }, 10);
    expect(result).toBe(out);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('euclidean distance가 maxDistance보다 크면 maxDistance만큼 이동한다', () => {
    const out = { x: 0, y: 0 };
    // distance = 10, maxDistance = 5 → 절반 지점
    moveTowardPointInto(out, { x: 0, y: 0 }, { x: 10, y: 0 }, 5);
    expect(out.x).toBeCloseTo(5, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('current === target (distance === 0)이면 target을 out에 복사한다', () => {
    const out = { x: 0, y: 0 };
    moveTowardPointInto(out, { x: 3, y: 3 }, { x: 3, y: 3 }, 5);
    expect(out).toEqual({ x: 3, y: 3 });
  });

  test('maxDistance === 0이면 current를 out에 복사한다', () => {
    const out = { x: 0, y: 0 };
    moveTowardPointInto(out, { x: 1, y: 2 }, { x: 5, y: 8 }, 0);
    expect(out).toEqual({ x: 1, y: 2 });
  });

  test('tuple input을 처리한다', () => {
    const out = { x: 0, y: 0 };
    moveTowardPointInto(out, [0, 0], [10, 0], 3);
    expect(out.x).toBeCloseTo(3, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('out === target aliasing에서 distance > maxDistance일 때 partial move가 올바르다', () => {
    // out과 target이 같은 object이고 distance(10) > maxDistance(5) → partial move 경로
    // current=(0,0), target=(6,8) → dist=10, maxDistance=5 → 절반 지점 (3,4)
    const pt: { x: number; y: number } = { x: 6, y: 8 };
    moveTowardPointInto(pt, { x: 0, y: 0 }, pt, 5);
    expect(pt.x).toBeCloseTo(3, 10);
    expect(pt.y).toBeCloseTo(4, 10);
  });

  test('음수 maxDistance는 RangeError를 던진다', () => {
    expect(() => moveTowardPointInto({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 5, y: 0 }, -1)).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'finite하지 않은 input %s는 RangeError를 던진다',
    (value) => {
      expect(() => moveTowardPointInto({ x: 0, y: 0 }, { x: value, y: 0 }, { x: 5, y: 0 }, 1)).toThrow(RangeError);
      expect(() => moveTowardPointInto({ x: 0, y: 0 }, { x: 0, y: value }, { x: 5, y: 0 }, 1)).toThrow(RangeError);
      expect(() => moveTowardPointInto({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: value, y: 0 }, 1)).toThrow(RangeError);
      expect(() => moveTowardPointInto({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 5, y: value }, 1)).toThrow(RangeError);
      expect(() => moveTowardPointInto({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 5, y: 0 }, value)).toThrow(RangeError);
    }
  );
});

describe('interpolation point 보간 - moveTowardPoint', () => {
  test('이동 결과를 반환한다', () => {
    expect(moveTowardPoint({ x: 0, y: 0 }, { x: 3, y: 4 }, 10)).toEqual({ x: 3, y: 4 });
  });
});

describe('interpolation 쌍선형 보간 - bilerpPointInto', () => {
  test('p00=(0,0), p10=(2,0), p01=(0,2), p11=(2,2) grid에서 tx=0.5, ty=0.5는 (1,1)을 반환한다', () => {
    const out = { x: 0, y: 0 };
    const result = bilerpPointInto(out, { x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 2 }, { x: 2, y: 2 }, 0.5, 0.5);
    expect(result).toBe(out);
    expect(out).toEqual({ x: 1, y: 1 });
  });

  test('tx=0, ty=0에서 p00을 반환한다', () => {
    const out = { x: 0, y: 0 };
    bilerpPointInto(out, { x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }, { x: 7, y: 8 }, 0, 0);
    expect(out).toEqual({ x: 1, y: 2 });
  });

  test('tx=1, ty=0에서 p10을 반환한다', () => {
    const out = { x: 0, y: 0 };
    bilerpPointInto(out, { x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }, { x: 7, y: 8 }, 1, 0);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('tx=0, ty=1에서 p01을 반환한다', () => {
    const out = { x: 0, y: 0 };
    bilerpPointInto(out, { x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }, { x: 7, y: 8 }, 0, 1);
    expect(out).toEqual({ x: 5, y: 6 });
  });

  test('tx=1, ty=1에서 p11을 반환한다', () => {
    const out = { x: 0, y: 0 };
    bilerpPointInto(out, { x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }, { x: 7, y: 8 }, 1, 1);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('x/y 축이 독립적으로 보간된다', () => {
    // x: p00.x=0, p10.x=4, p01.x=0, p11.x=4, tx=0.25 → x=1
    // y: p00.y=0, p10.y=0, p01.y=6, p11.y=6, ty=1/3 → y=2
    const out = { x: 0, y: 0 };
    bilerpPointInto(out, { x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 6 }, { x: 4, y: 6 }, 0.25, 1 / 3);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(2, 10);
  });

  test('tuple input을 처리한다', () => {
    const out = { x: 0, y: 0 };
    bilerpPointInto(out, [0, 0], [2, 0], [0, 2], [2, 2], 0.5, 0.5);
    expect(out).toEqual({ x: 1, y: 1 });
  });

  test('mutable tuple out에 결과를 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = bilerpPointInto(out, [0, 0], [2, 0], [0, 2], [2, 2], 0.5, 0.5);
    expect(result).toBe(out);
    expect(out[0]).toBe(1);
    expect(out[1]).toBe(1);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'finite하지 않은 input %s는 RangeError를 던진다',
    (value) => {
      const base = { x: 0, y: 0 };
      expect(() => bilerpPointInto(base, { x: value, y: 0 }, [1, 0], [0, 1], [1, 1], 0.5, 0.5)).toThrow(RangeError);
      expect(() => bilerpPointInto(base, { x: 0, y: value }, [1, 0], [0, 1], [1, 1], 0.5, 0.5)).toThrow(RangeError);
      expect(() => bilerpPointInto(base, [0, 0], { x: value, y: 0 }, [0, 1], [1, 1], 0.5, 0.5)).toThrow(RangeError);
      expect(() => bilerpPointInto(base, [0, 0], { x: 0, y: value }, [0, 1], [1, 1], 0.5, 0.5)).toThrow(RangeError);
      expect(() => bilerpPointInto(base, [0, 0], [1, 0], { x: value, y: 1 }, [1, 1], 0.5, 0.5)).toThrow(RangeError);
      expect(() => bilerpPointInto(base, [0, 0], [1, 0], { x: 0, y: value }, [1, 1], 0.5, 0.5)).toThrow(RangeError);
      expect(() => bilerpPointInto(base, [0, 0], [1, 0], [0, 1], { x: value, y: 1 }, 0.5, 0.5)).toThrow(RangeError);
      expect(() => bilerpPointInto(base, [0, 0], [1, 0], [0, 1], { x: 1, y: value }, 0.5, 0.5)).toThrow(RangeError);
      expect(() => bilerpPointInto(base, [0, 0], [1, 0], [0, 1], [1, 1], value, 0.5)).toThrow(RangeError);
      expect(() => bilerpPointInto(base, [0, 0], [1, 0], [0, 1], [1, 1], 0.5, value)).toThrow(RangeError);
    }
  );
});

describe('interpolation 쌍선형 보간 - bilerpPoint', () => {
  test('새 plain object를 반환한다', () => {
    const result = bilerpPoint({ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 2 }, { x: 2, y: 2 }, 0.5, 0.5);
    expect(result).toEqual({ x: 1, y: 1 });
  });
});

describe('interpolation point elapsed-time - lerpPointByElapsedInto', () => {
  const nonFiniteValues = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

  test('elapsed=0에서 a 좌표를 반환한다', () => {
    const out = { x: 0, y: 0 };
    const result = lerpPointByElapsedInto(out, { x: 1, y: 2 }, { x: 5, y: 8 }, 0, 10);
    expect(result).toBe(out);
    expect(out).toEqual({ x: 1, y: 2 });
  });

  test('elapsed=duration에서 b 좌표를 반환한다', () => {
    const out = { x: 0, y: 0 };
    lerpPointByElapsedInto(out, { x: 1, y: 2 }, { x: 5, y: 8 }, 10, 10);
    expect(out).toEqual({ x: 5, y: 8 });
  });

  test('elapsed=duration/2에서 midpoint를 반환한다', () => {
    const out = { x: 0, y: 0 };
    lerpPointByElapsedInto(out, { x: 0, y: 0 }, { x: 4, y: 6 }, 5, 10);
    expect(out).toEqual({ x: 2, y: 3 });
  });

  test('negative elapsed는 a 이전 extrapolation을 반환한다', () => {
    const out = { x: 0, y: 0 };
    lerpPointByElapsedInto(out, { x: 0, y: 0 }, { x: 4, y: 6 }, -5, 10);
    expect(out).toEqual({ x: -2, y: -3 });
  });

  test('over-duration elapsed는 b 이후 extrapolation을 반환한다', () => {
    const out = { x: 0, y: 0 };
    lerpPointByElapsedInto(out, { x: 0, y: 0 }, { x: 4, y: 6 }, 15, 10);
    expect(out).toEqual({ x: 6, y: 9 });
  });

  test('tuple input을 처리한다', () => {
    const out = { x: 0, y: 0 };
    lerpPointByElapsedInto(out, [0, 0], [10, 20], 5, 10);
    expect(out).toEqual({ x: 5, y: 10 });
  });

  test('mutable tuple out에 결과를 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = lerpPointByElapsedInto(out, { x: 0, y: 0 }, { x: 4, y: 6 }, 5, 10);
    expect(result).toBe(out);
    expect(out[0]).toBe(2);
    expect(out[1]).toBe(3);
  });

  test('out === a aliasing에서도 올바른 결과를 반환한다', () => {
    const pt: { x: number; y: number } = { x: 0, y: 0 };
    lerpPointByElapsedInto(pt, pt, { x: 4, y: 6 }, 5, 10);
    expect(pt).toEqual({ x: 2, y: 3 });
  });

  test('out === b aliasing에서도 올바른 결과를 반환한다', () => {
    const pt: { x: number; y: number } = { x: 4, y: 6 };
    lerpPointByElapsedInto(pt, { x: 0, y: 0 }, pt, 5, 10);
    expect(pt).toEqual({ x: 2, y: 3 });
  });

  test('duration <= 0은 RangeError를 던진다', () => {
    expect(() => lerpPointByElapsedInto({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 1 }, 5, 0)).toThrow(RangeError);
    expect(() => lerpPointByElapsedInto({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 1 }, 5, -1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('a의 x/y가 finite하지 않으면 RangeError를 던진다 (%s)', (value) => {
    expect(() => lerpPointByElapsedInto({ x: 0, y: 0 }, { x: value, y: 0 }, { x: 1, y: 1 }, 5, 10)).toThrow(RangeError);
    expect(() => lerpPointByElapsedInto({ x: 0, y: 0 }, { x: 0, y: value }, { x: 1, y: 1 }, 5, 10)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('b의 x/y가 finite하지 않으면 RangeError를 던진다 (%s)', (value) => {
    expect(() => lerpPointByElapsedInto({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: value, y: 1 }, 5, 10)).toThrow(RangeError);
    expect(() => lerpPointByElapsedInto({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: value }, 5, 10)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('elapsed가 finite하지 않으면 RangeError를 던진다 (%s)', (value) => {
    expect(() => lerpPointByElapsedInto({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 1 }, value, 10)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('duration이 finite하지 않으면 RangeError를 던진다 (%s)', (value) => {
    expect(() => lerpPointByElapsedInto({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 1 }, 5, value)).toThrow(RangeError);
  });
});

describe('interpolation point elapsed-time - lerpPointByElapsed', () => {
  test('새 plain object를 반환한다', () => {
    const result = lerpPointByElapsed({ x: 0, y: 0 }, { x: 4, y: 6 }, 5, 10);
    expect(result).toEqual({ x: 2, y: 3 });
  });

  test('duration <= 0은 RangeError를 던진다', () => {
    expect(() => lerpPointByElapsed({ x: 0, y: 0 }, { x: 1, y: 1 }, 5, 0)).toThrow(RangeError);
  });
});
