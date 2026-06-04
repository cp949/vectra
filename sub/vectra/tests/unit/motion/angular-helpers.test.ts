/**
 * motion angular helper(`angularVelocity`, `angularDisplacement`, `angularVelocityAfter`,
 * `moveTowardAngleByElapsed`) 단위 테스트.
 */

import { describe, expect, test } from 'vitest';
import * as motion from '../../../src/motion';
import { angularDisplacement } from '../../../src/motion/angular-displacement';
import { angularVelocity } from '../../../src/motion/angular-velocity';
import { angularVelocityAfter } from '../../../src/motion/angular-velocity-after';
import { moveTowardAngleByElapsed } from '../../../src/motion/move-toward-angle-by-elapsed';

describe('angularVelocity', () => {
  test('angleDelta / duration을 반환한다', () => {
    expect(angularVelocity(0, Math.PI / 2, 2)).toBe(Math.PI / 4);
  });

  test('shortest path는 wrap을 가로질러 계산한다', () => {
    expect(angularVelocity(Math.PI * 0.75, -Math.PI * 0.75, 2)).toBeCloseTo(Math.PI / 4, 12);
  });

  test('antipodal tie는 -Math.PI 방향으로 감긴다', () => {
    expect(angularVelocity(0, Math.PI, 2)).toBe(-Math.PI / 2);
  });

  test('duration === 0은 undefined를 반환한다', () => {
    expect(angularVelocity(0, 1, 0)).toBeUndefined();
  });

  test('duration < 0은 역방향 closed-form으로 평가한다', () => {
    expect(angularVelocity(0, Math.PI / 2, -2)).toBe(-Math.PI / 4);
  });

  test('결과 -0은 0으로 canonicalize한다', () => {
    const result = angularVelocity(0, 0, -2);

    expect(result).toBe(0);
    expect(Object.is(result, -0)).toBe(false);
  });

  test.each([
    ['fromAngle', [Number.NaN, 1, 2]],
    ['fromAngle', [Number.POSITIVE_INFINITY, 1, 2]],
    ['fromAngle', [Number.NEGATIVE_INFINITY, 1, 2]],
    ['toAngle', [0, Number.NaN, 2]],
    ['toAngle', [0, Number.POSITIVE_INFINITY, 2]],
    ['toAngle', [0, Number.NEGATIVE_INFINITY, 2]],
    ['duration', [0, 1, Number.NaN]],
    ['duration', [0, 1, Number.POSITIVE_INFINITY]],
    ['duration', [0, 1, Number.NEGATIVE_INFINITY]],
  ] as const)('%s 위치의 non-finite 입력은 RangeError', (_name, [from, to, duration]) => {
    expect(() => angularVelocity(from, to, duration)).toThrow(RangeError);
  });

  test('overflow 결과는 RangeError', () => {
    expect(() => angularVelocity(0, Math.PI, Number.MIN_VALUE)).toThrow(RangeError);
  });

  test('barrel에서 angularVelocity를 re-export한다', () => {
    expect(motion.angularVelocity(0, Math.PI / 2, 2)).toBe(Math.PI / 4);
  });
});

describe('angularDisplacement', () => {
  test('angularVelocity * duration을 반환한다', () => {
    expect(angularDisplacement(Math.PI / 4, 2)).toBe(Math.PI / 2);
  });

  test('결과를 normalize하지 않는다', () => {
    expect(angularDisplacement(Math.PI, 3)).toBe(3 * Math.PI);
  });

  test('duration < 0은 역방향 closed-form으로 평가한다', () => {
    expect(angularDisplacement(Math.PI / 4, -2)).toBe(-Math.PI / 2);
  });

  test('결과 -0은 0으로 canonicalize한다', () => {
    const result = angularDisplacement(-0, 3);

    expect(result).toBe(0);
    expect(Object.is(result, -0)).toBe(false);
  });

  test.each([
    ['angularVelocity', [Number.NaN, 2]],
    ['angularVelocity', [Number.POSITIVE_INFINITY, 2]],
    ['angularVelocity', [Number.NEGATIVE_INFINITY, 2]],
    ['duration', [Math.PI, Number.NaN]],
    ['duration', [Math.PI, Number.POSITIVE_INFINITY]],
    ['duration', [Math.PI, Number.NEGATIVE_INFINITY]],
  ] as const)('%s 위치의 non-finite 입력은 RangeError', (_name, [velocity, duration]) => {
    expect(() => angularDisplacement(velocity, duration)).toThrow(RangeError);
  });

  test('overflow 결과는 RangeError', () => {
    expect(() => angularDisplacement(Number.MAX_VALUE, Number.MAX_VALUE)).toThrow(RangeError);
  });

  test('barrel에서 angularDisplacement를 re-export한다', () => {
    expect(motion.angularDisplacement(Math.PI / 4, 2)).toBe(Math.PI / 2);
  });
});

describe('angularVelocityAfter', () => {
  test('initialAngularVelocity + angularAcceleration * duration을 반환한다', () => {
    expect(angularVelocityAfter(Math.PI / 4, Math.PI / 8, 2)).toBe(Math.PI / 2);
  });

  test('결과를 normalize하지 않는다', () => {
    expect(angularVelocityAfter(Math.PI, Math.PI, 3)).toBe(4 * Math.PI);
  });

  test('duration < 0은 역방향 closed-form으로 평가한다', () => {
    expect(angularVelocityAfter(Math.PI / 4, Math.PI / 8, -2)).toBe(0);
  });

  test('결과 -0은 0으로 canonicalize한다', () => {
    const result = angularVelocityAfter(-0, -0, 1);

    expect(result).toBe(0);
    expect(Object.is(result, -0)).toBe(false);
  });

  test.each([
    ['initialAngularVelocity', [Number.NaN, 1, 2]],
    ['initialAngularVelocity', [Number.POSITIVE_INFINITY, 1, 2]],
    ['initialAngularVelocity', [Number.NEGATIVE_INFINITY, 1, 2]],
    ['angularAcceleration', [1, Number.NaN, 2]],
    ['angularAcceleration', [1, Number.POSITIVE_INFINITY, 2]],
    ['angularAcceleration', [1, Number.NEGATIVE_INFINITY, 2]],
    ['duration', [1, 1, Number.NaN]],
    ['duration', [1, 1, Number.POSITIVE_INFINITY]],
    ['duration', [1, 1, Number.NEGATIVE_INFINITY]],
  ] as const)('%s 위치의 non-finite 입력은 RangeError', (_name, [omega0, alpha, duration]) => {
    expect(() => angularVelocityAfter(omega0, alpha, duration)).toThrow(RangeError);
  });

  test('overflow 결과는 RangeError', () => {
    expect(() => angularVelocityAfter(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE)).toThrow(RangeError);
  });

  test('barrel에서 angularVelocityAfter를 re-export한다', () => {
    expect(motion.angularVelocityAfter(Math.PI / 4, Math.PI / 8, 2)).toBe(Math.PI / 2);
  });
});

describe('moveTowardAngleByElapsed', () => {
  test('step이 부족하면 shortest direction으로 step만큼 이동한다', () => {
    expect(moveTowardAngleByElapsed(0, Math.PI / 2, Math.PI / 4, 1)).toBe(Math.PI / 4);
  });

  test('step이 충분하면 target으로 clamp한다', () => {
    expect(moveTowardAngleByElapsed(0, Math.PI / 2, Math.PI, 1)).toBe(Math.PI / 2);
  });

  test('shortest path는 wrap을 가로질러 이동한다', () => {
    expect(moveTowardAngleByElapsed(Math.PI * 0.75, -Math.PI * 0.75, Math.PI / 4, 1)).toBeCloseTo(Math.PI, 12);
  });

  test('antipodal tie는 negative direction으로 이동한다', () => {
    expect(moveTowardAngleByElapsed(0, Math.PI, Math.PI / 2, 1)).toBe(-Math.PI / 2);
  });

  test('current === target이면 target을 그대로 반환한다', () => {
    expect(moveTowardAngleByElapsed(5, 5, 1, 1)).toBe(5);
  });

  test('maxAngularSpeed === 0이면 이동하지 않는다', () => {
    expect(moveTowardAngleByElapsed(0, 1, 0, 1)).toBe(0);
  });

  test('elapsed === 0이면 이동하지 않는다', () => {
    expect(moveTowardAngleByElapsed(0, 1, 1, 0)).toBe(0);
  });

  test('target clamp 시 caller가 전달한 target scalar를 normalize 없이 보존한다', () => {
    expect(moveTowardAngleByElapsed(0, 10, Math.PI, 1)).toBe(10);
  });

  test.each([
    ['maxAngularSpeed', [0, 1, -1, 1]],
    ['elapsed', [0, 1, 1, -1]],
  ] as const)('%s 음수는 RangeError', (_name, [current, target, speed, elapsed]) => {
    expect(() => moveTowardAngleByElapsed(current, target, speed, elapsed)).toThrow(RangeError);
  });

  test.each([
    ['current', [Number.NaN, 1, 1, 1]],
    ['current', [Number.POSITIVE_INFINITY, 1, 1, 1]],
    ['current', [Number.NEGATIVE_INFINITY, 1, 1, 1]],
    ['target', [0, Number.NaN, 1, 1]],
    ['target', [0, Number.POSITIVE_INFINITY, 1, 1]],
    ['target', [0, Number.NEGATIVE_INFINITY, 1, 1]],
    ['maxAngularSpeed', [0, 1, Number.NaN, 1]],
    ['maxAngularSpeed', [0, 1, Number.POSITIVE_INFINITY, 1]],
    ['maxAngularSpeed', [0, 1, Number.NEGATIVE_INFINITY, 1]],
    ['elapsed', [0, 1, 1, Number.NaN]],
    ['elapsed', [0, 1, 1, Number.POSITIVE_INFINITY]],
    ['elapsed', [0, 1, 1, Number.NEGATIVE_INFINITY]],
  ] as const)('%s 위치의 non-finite 입력은 RangeError', (_name, [current, target, speed, elapsed]) => {
    expect(() => moveTowardAngleByElapsed(current, target, speed, elapsed)).toThrow(RangeError);
  });

  test('overflow step은 RangeError', () => {
    expect(() => moveTowardAngleByElapsed(0, Math.PI, Number.MAX_VALUE, Number.MAX_VALUE)).toThrow(RangeError);
  });

  test('결과 -0은 0으로 canonicalize한다', () => {
    const result = moveTowardAngleByElapsed(-0, -0, 1, 1);

    expect(result).toBe(0);
    expect(Object.is(result, -0)).toBe(false);
  });

  test('barrel에서 moveTowardAngleByElapsed를 re-export한다', () => {
    expect(motion.moveTowardAngleByElapsed(0, Math.PI / 2, Math.PI / 4, 1)).toBe(Math.PI / 4);
  });
});
