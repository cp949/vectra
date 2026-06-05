/**
 * motion inverse/stop/move helper 단위 테스트.
 *
 * 대상: `acceleration`, `accelerationFromDisplacement`, `initialVelocity`,
 * `initialVelocityFromDisplacement`, `timeToVelocity`, `timeToDisplacement`,
 * `stopDistance`, `stopDuration`, `durationByDistance`, `moveTowardByElapsed`.
 */

import { describe, expect, test } from 'vitest';
import { acceleration } from '../../../src/motion/acceleration';
import { accelerationFromDisplacement } from '../../../src/motion/acceleration-from-displacement';
import { durationByDistance } from '../../../src/motion/duration-by-distance';
import { initialVelocity } from '../../../src/motion/initial-velocity';
import { initialVelocityFromDisplacement } from '../../../src/motion/initial-velocity-from-displacement';
import { type MoveTowardResult, moveTowardByElapsed } from '../../../src/motion/move-toward-by-elapsed';
import { stopDistance } from '../../../src/motion/stop-distance';
import { stopDuration } from '../../../src/motion/stop-duration';
import { timeToDisplacement } from '../../../src/motion/time-to-displacement';
import { timeToVelocity } from '../../../src/motion/time-to-velocity';

describe('acceleration', () => {
  test('(v1 - v0) / t를 반환한다', () => {
    expect(acceleration(2, 14, 4)).toBe(3);
  });

  test('time < 0은 역방향 closed-form으로 평가한다', () => {
    expect(acceleration(2, -1, -1)).toBe(3);
  });

  test('time === 0은 non-unique이므로 undefined', () => {
    expect(acceleration(2, 2, 0)).toBeUndefined();
  });

  test('결과 -0은 0으로 canonicalize한다', () => {
    const result = acceleration(0, 0, 4);

    expect(result).toBe(0);
    expect(Object.is(result, -0)).toBe(false);
  });

  test.each([
    ['initialVelocity', [Number.NaN, 14, 4]],
    ['initialVelocity', [Number.POSITIVE_INFINITY, 14, 4]],
    ['initialVelocity', [Number.NEGATIVE_INFINITY, 14, 4]],
    ['finalVelocity', [2, Number.NaN, 4]],
    ['finalVelocity', [2, Number.POSITIVE_INFINITY, 4]],
    ['finalVelocity', [2, Number.NEGATIVE_INFINITY, 4]],
    ['time', [2, 14, Number.NaN]],
    ['time', [2, 14, Number.POSITIVE_INFINITY]],
    ['time', [2, 14, Number.NEGATIVE_INFINITY]],
  ] as const)('%s 위치의 non-finite 입력은 RangeError', (_name, [v0, v1, t]) => {
    expect(() => acceleration(v0, v1, t)).toThrow(RangeError);
  });

  test('overflow 결과는 RangeError', () => {
    expect(() => acceleration(-Number.MAX_VALUE, Number.MAX_VALUE, Number.MIN_VALUE)).toThrow(RangeError);
  });
});

describe('accelerationFromDisplacement', () => {
  test('2 * (d - v0 * t) / t^2를 반환한다', () => {
    expect(accelerationFromDisplacement(2, 32, 4)).toBe(3);
  });

  test('time < 0은 역방향 closed-form으로 평가한다', () => {
    expect(accelerationFromDisplacement(2, -0.5, -1)).toBe(3);
  });

  test('time === 0은 non-unique이므로 undefined', () => {
    expect(accelerationFromDisplacement(2, 0, 0)).toBeUndefined();
  });

  test('결과 -0은 0으로 canonicalize한다', () => {
    const result = accelerationFromDisplacement(0, 0, 4);

    expect(result).toBe(0);
    expect(Object.is(result, -0)).toBe(false);
  });

  test.each([
    ['initialVelocity', [Number.NaN, 32, 4]],
    ['initialVelocity', [Number.POSITIVE_INFINITY, 32, 4]],
    ['initialVelocity', [Number.NEGATIVE_INFINITY, 32, 4]],
    ['displacement', [2, Number.NaN, 4]],
    ['displacement', [2, Number.POSITIVE_INFINITY, 4]],
    ['displacement', [2, Number.NEGATIVE_INFINITY, 4]],
    ['time', [2, 32, Number.NaN]],
    ['time', [2, 32, Number.POSITIVE_INFINITY]],
    ['time', [2, 32, Number.NEGATIVE_INFINITY]],
  ] as const)('%s 위치의 non-finite 입력은 RangeError', (_name, [v0, d, t]) => {
    expect(() => accelerationFromDisplacement(v0, d, t)).toThrow(RangeError);
  });

  test('overflow 결과는 RangeError', () => {
    expect(() => accelerationFromDisplacement(0, Number.MAX_VALUE, Number.MIN_VALUE)).toThrow(RangeError);
  });
});

describe('initialVelocity', () => {
  test('v1 - a * t를 반환한다', () => {
    expect(initialVelocity(14, 3, 4)).toBe(2);
  });

  test('time === 0은 finalVelocity를 그대로 반환한다', () => {
    expect(initialVelocity(2, 3, 0)).toBe(2);
  });

  test('time < 0은 역방향 closed-form으로 평가한다', () => {
    expect(initialVelocity(2, 3, -1)).toBe(5);
  });

  test('결과 -0은 0으로 canonicalize한다', () => {
    const result = initialVelocity(0, 0, 4);

    expect(result).toBe(0);
    expect(Object.is(result, -0)).toBe(false);
  });

  test.each([
    ['finalVelocity', [Number.NaN, 3, 4]],
    ['finalVelocity', [Number.POSITIVE_INFINITY, 3, 4]],
    ['finalVelocity', [Number.NEGATIVE_INFINITY, 3, 4]],
    ['acceleration', [14, Number.NaN, 4]],
    ['acceleration', [14, Number.POSITIVE_INFINITY, 4]],
    ['acceleration', [14, Number.NEGATIVE_INFINITY, 4]],
    ['time', [14, 3, Number.NaN]],
    ['time', [14, 3, Number.POSITIVE_INFINITY]],
    ['time', [14, 3, Number.NEGATIVE_INFINITY]],
  ] as const)('%s 위치의 non-finite 입력은 RangeError', (_name, [v1, a, t]) => {
    expect(() => initialVelocity(v1, a, t)).toThrow(RangeError);
  });

  test('overflow 결과는 RangeError', () => {
    expect(() => initialVelocity(-Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE)).toThrow(RangeError);
  });
});

describe('initialVelocityFromDisplacement', () => {
  test('(d - 0.5 * a * t^2) / t를 반환한다', () => {
    expect(initialVelocityFromDisplacement(32, 3, 4)).toBe(2);
  });

  test('time < 0은 역방향 closed-form으로 평가한다', () => {
    expect(initialVelocityFromDisplacement(-0.5, 3, -1)).toBe(2);
  });

  test('time === 0은 non-unique이므로 undefined', () => {
    expect(initialVelocityFromDisplacement(0, 3, 0)).toBeUndefined();
  });

  test('결과 -0은 0으로 canonicalize한다', () => {
    const result = initialVelocityFromDisplacement(0, 0, 4);

    expect(result).toBe(0);
    expect(Object.is(result, -0)).toBe(false);
  });

  test.each([
    ['displacement', [Number.NaN, 3, 4]],
    ['displacement', [Number.POSITIVE_INFINITY, 3, 4]],
    ['displacement', [Number.NEGATIVE_INFINITY, 3, 4]],
    ['acceleration', [32, Number.NaN, 4]],
    ['acceleration', [32, Number.POSITIVE_INFINITY, 4]],
    ['acceleration', [32, Number.NEGATIVE_INFINITY, 4]],
    ['time', [32, 3, Number.NaN]],
    ['time', [32, 3, Number.POSITIVE_INFINITY]],
    ['time', [32, 3, Number.NEGATIVE_INFINITY]],
  ] as const)('%s 위치의 non-finite 입력은 RangeError', (_name, [d, a, t]) => {
    expect(() => initialVelocityFromDisplacement(d, a, t)).toThrow(RangeError);
  });

  test('overflow 결과는 RangeError', () => {
    expect(() => initialVelocityFromDisplacement(Number.MAX_VALUE, 0, Number.MIN_VALUE)).toThrow(RangeError);
  });
});

describe('timeToVelocity', () => {
  test('(v1 - v0) / a를 반환한다', () => {
    expect(timeToVelocity(2, 3, 14)).toBe(4);
  });

  test('a === 0이고 v1 === v0이면 earliest solution 0', () => {
    expect(timeToVelocity(2, 0, 2)).toBe(0);
  });

  test('a === 0인데 v1 !== v0이면 도달 불가이므로 undefined', () => {
    expect(timeToVelocity(2, 0, 3)).toBeUndefined();
  });

  test('결과 -0은 0으로 canonicalize한다', () => {
    const result = timeToVelocity(0, -3, 0);

    expect(result).toBe(0);
    expect(Object.is(result, -0)).toBe(false);
  });

  test.each([
    ['initialVelocity', [Number.NaN, 3, 14]],
    ['initialVelocity', [Number.POSITIVE_INFINITY, 3, 14]],
    ['initialVelocity', [Number.NEGATIVE_INFINITY, 3, 14]],
    ['acceleration', [2, Number.NaN, 14]],
    ['acceleration', [2, Number.POSITIVE_INFINITY, 14]],
    ['acceleration', [2, Number.NEGATIVE_INFINITY, 14]],
    ['finalVelocity', [2, 3, Number.NaN]],
    ['finalVelocity', [2, 3, Number.POSITIVE_INFINITY]],
    ['finalVelocity', [2, 3, Number.NEGATIVE_INFINITY]],
  ] as const)('%s 위치의 non-finite 입력은 RangeError', (_name, [v0, a, v1]) => {
    expect(() => timeToVelocity(v0, a, v1)).toThrow(RangeError);
  });

  test('overflow 결과는 RangeError', () => {
    expect(() => timeToVelocity(-Number.MAX_VALUE, Number.MIN_VALUE, Number.MAX_VALUE)).toThrow(RangeError);
  });
});

describe('timeToDisplacement', () => {
  test('가장 작은 non-negative root를 반환한다', () => {
    expect(timeToDisplacement(2, 3, 32)).toBe(4);
  });

  test('displacement === 0이면 earliest solution 0', () => {
    const result = timeToDisplacement(2, 3, 0);

    expect(result).toBe(0);
    expect(Object.is(result, -0)).toBe(false);
  });

  test('a === 0 등속에서 음수 root만 나오면 undefined', () => {
    expect(timeToDisplacement(2, 0, -4)).toBeUndefined();
  });

  test('discriminant가 음수면 undefined', () => {
    expect(timeToDisplacement(0, 1, -1)).toBeUndefined();
  });

  test('a === 0이고 v0 === 0이면 변위 불가이므로 undefined', () => {
    expect(timeToDisplacement(0, 0, 4)).toBeUndefined();
  });

  test('a === 0 등속 양수 해를 반환한다', () => {
    expect(timeToDisplacement(2, 0, 8)).toBe(4);
  });

  test('두 양수 root 중 더 작은 값을 선택한다', () => {
    // 0.5 * (-1) * t^2 + 5 * t - 8 = 0 → t = 2 또는 t = 8. earliest는 2.
    expect(timeToDisplacement(5, -1, 8)).toBe(2);
  });

  test('discriminant === 0이면 중근을 반환한다', () => {
    // 0.5 * (-1) * t^2 + 2 * t - 2 = 0 → discriminant = 4 + 2*(-1)*2 = 0, 중근 t = 2.
    expect(timeToDisplacement(2, -1, 2)).toBe(2);
  });

  test('작은 a와 큰 v0에서도 작은 root를 cancellation 없이 반환한다', () => {
    // naive (-v0 + sqrt(disc)) / a는 0으로 소거된다. 안정 해는 1e-8이다.
    expect(timeToDisplacement(1e8, 1e-10, 1)).toBeCloseTo(1e-8, 18);
  });

  test('discriminant가 +Infinity로 overflow하면 RangeError', () => {
    // v0^2가 +Infinity로 overflow한다.
    expect(() => timeToDisplacement(Number.MAX_VALUE, 1, Number.MAX_VALUE)).toThrow(RangeError);
  });

  test('discriminant가 NaN으로 overflow하면 RangeError', () => {
    // v0^2 = +Infinity, 2 * a * d = -Infinity → discriminant = NaN. undefined가 아니라 RangeError.
    expect(() => timeToDisplacement(1e200, -1e200, 1e200)).toThrow(RangeError);
  });

  test.each([
    ['initialVelocity', [Number.NaN, 3, 32]],
    ['initialVelocity', [Number.POSITIVE_INFINITY, 3, 32]],
    ['initialVelocity', [Number.NEGATIVE_INFINITY, 3, 32]],
    ['acceleration', [2, Number.NaN, 32]],
    ['acceleration', [2, Number.POSITIVE_INFINITY, 32]],
    ['acceleration', [2, Number.NEGATIVE_INFINITY, 32]],
    ['displacement', [2, 3, Number.NaN]],
    ['displacement', [2, 3, Number.POSITIVE_INFINITY]],
    ['displacement', [2, 3, Number.NEGATIVE_INFINITY]],
  ] as const)('%s 위치의 non-finite 입력은 RangeError', (_name, [v0, a, d]) => {
    expect(() => timeToDisplacement(v0, a, d)).toThrow(RangeError);
  });

  test('overflow 결과는 RangeError', () => {
    expect(() => timeToDisplacement(Number.MIN_VALUE, 0, Number.MAX_VALUE)).toThrow(RangeError);
  });
});

describe('stopDistance', () => {
  test('v0^2 / (2 * deceleration)를 반환한다', () => {
    expect(stopDistance(10, 2)).toBe(25);
  });

  test('v0 === 0이면 0', () => {
    const result = stopDistance(0, 2);

    expect(result).toBe(0);
    expect(Object.is(result, -0)).toBe(false);
  });

  test('v0 부호는 결과에 영향을 주지 않는다', () => {
    expect(stopDistance(-10, 2)).toBe(25);
  });

  test.each([
    ['deceleration === 0', [10, 0]],
    ['deceleration < 0', [10, -2]],
  ] as const)('%s는 RangeError', (_name, [v0, dec]) => {
    expect(() => stopDistance(v0, dec)).toThrow(RangeError);
  });

  test.each([
    ['initialVelocity', [Number.NaN, 2]],
    ['initialVelocity', [Number.POSITIVE_INFINITY, 2]],
    ['initialVelocity', [Number.NEGATIVE_INFINITY, 2]],
    ['deceleration', [10, Number.NaN]],
    ['deceleration', [10, Number.POSITIVE_INFINITY]],
    ['deceleration', [10, Number.NEGATIVE_INFINITY]],
  ] as const)('%s 위치의 non-finite 입력은 RangeError', (_name, [v0, dec]) => {
    expect(() => stopDistance(v0, dec)).toThrow(RangeError);
  });

  test('overflow 결과는 RangeError', () => {
    expect(() => stopDistance(Number.MAX_VALUE, Number.MIN_VALUE)).toThrow(RangeError);
  });
});

describe('stopDuration', () => {
  test('abs(v0) / deceleration를 반환한다', () => {
    expect(stopDuration(-10, 2)).toBe(5);
  });

  test('v0 === 0이면 0', () => {
    const result = stopDuration(0, 2);

    expect(result).toBe(0);
    expect(Object.is(result, -0)).toBe(false);
  });

  test.each([
    ['deceleration === 0', [10, 0]],
    ['deceleration < 0', [10, -2]],
  ] as const)('%s는 RangeError', (_name, [v0, dec]) => {
    expect(() => stopDuration(v0, dec)).toThrow(RangeError);
  });

  test.each([
    ['initialVelocity', [Number.NaN, 2]],
    ['initialVelocity', [Number.POSITIVE_INFINITY, 2]],
    ['initialVelocity', [Number.NEGATIVE_INFINITY, 2]],
    ['deceleration', [10, Number.NaN]],
    ['deceleration', [10, Number.POSITIVE_INFINITY]],
    ['deceleration', [10, Number.NEGATIVE_INFINITY]],
  ] as const)('%s 위치의 non-finite 입력은 RangeError', (_name, [v0, dec]) => {
    expect(() => stopDuration(v0, dec)).toThrow(RangeError);
  });

  test('overflow 결과는 RangeError', () => {
    expect(() => stopDuration(Number.MAX_VALUE, Number.MIN_VALUE)).toThrow(RangeError);
  });
});

describe('durationByDistance', () => {
  test('distance / speed를 반환한다', () => {
    expect(durationByDistance(10, 2)).toBe(5);
  });

  test('distance === 0이면 0', () => {
    const result = durationByDistance(0, 2);

    expect(result).toBe(0);
    expect(Object.is(result, -0)).toBe(false);
  });

  test.each([
    ['distance < 0', [-1, 2]],
    ['speed === 0', [10, 0]],
    ['speed < 0', [10, -2]],
  ] as const)('%s는 RangeError', (_name, [distance, speed]) => {
    expect(() => durationByDistance(distance, speed)).toThrow(RangeError);
  });

  test.each([
    ['distance', [Number.NaN, 2]],
    ['distance', [Number.POSITIVE_INFINITY, 2]],
    ['distance', [Number.NEGATIVE_INFINITY, 2]],
    ['speed', [10, Number.NaN]],
    ['speed', [10, Number.POSITIVE_INFINITY]],
    ['speed', [10, Number.NEGATIVE_INFINITY]],
  ] as const)('%s 위치의 non-finite 입력은 RangeError', (_name, [distance, speed]) => {
    expect(() => durationByDistance(distance, speed)).toThrow(RangeError);
  });

  test('overflow 결과는 RangeError', () => {
    expect(() => durationByDistance(Number.MAX_VALUE, Number.MIN_VALUE)).toThrow(RangeError);
  });
});

describe('moveTowardByElapsed', () => {
  test('overshoot하지 않으면 step만큼 전진한다', () => {
    expect(moveTowardByElapsed(0, 10, 3, 2)).toEqual({
      value: 6,
      reached: false,
    });
  });

  test('step이 거리 이상이면 target으로 clamp하고 reached', () => {
    expect(moveTowardByElapsed(0, 10, 10, 2)).toEqual({
      value: 10,
      reached: true,
    });
  });

  test('step이 거리와 정확히 같으면 target으로 clamp하고 reached', () => {
    // step = 5 * 2 = 10 === distance 10. step >= distance 경계의 등호.
    expect(moveTowardByElapsed(0, 10, 5, 2)).toEqual({
      value: 10,
      reached: true,
    });
  });

  test('역방향 이동도 step만큼 전진한다', () => {
    expect(moveTowardByElapsed(10, 0, 3, 2)).toEqual({
      value: 4,
      reached: false,
    });
  });

  test('current === target이면 reached', () => {
    expect(moveTowardByElapsed(5, 5, 3, 2)).toEqual({
      value: 5,
      reached: true,
    });
  });

  test('maxSpeed === 0이고 target이 다르면 제자리, reached false', () => {
    expect(moveTowardByElapsed(0, 10, 0, 2)).toEqual({
      value: 0,
      reached: false,
    });
  });

  test('elapsed === 0이고 target이 다르면 제자리, reached false', () => {
    expect(moveTowardByElapsed(0, 10, 3, 0)).toEqual({
      value: 0,
      reached: false,
    });
  });

  test('value의 -0은 0으로 canonicalize한다', () => {
    const result = moveTowardByElapsed(0, -10, 0, 5);

    expect(result).toEqual({ value: 0, reached: false });
    expect(Object.is(result.value, -0)).toBe(false);
  });

  test('reached 분기에서 target -0을 0으로 canonicalize한다', () => {
    const result = moveTowardByElapsed(0, -0, 1, 1);

    expect(result).toEqual({ value: 0, reached: true });
    expect(Object.is(result.value, -0)).toBe(false);
  });

  test.each([
    ['maxSpeed < 0', [0, 10, -1, 2]],
    ['elapsed < 0', [0, 10, 3, -1]],
  ] as const)('%s는 RangeError', (_name, [current, target, maxSpeed, elapsed]) => {
    expect(() => moveTowardByElapsed(current, target, maxSpeed, elapsed)).toThrow(RangeError);
  });

  test.each([
    ['current', [Number.NaN, 10, 3, 2]],
    ['current', [Number.POSITIVE_INFINITY, 10, 3, 2]],
    ['current', [Number.NEGATIVE_INFINITY, 10, 3, 2]],
    ['target', [0, Number.NaN, 3, 2]],
    ['target', [0, Number.POSITIVE_INFINITY, 3, 2]],
    ['target', [0, Number.NEGATIVE_INFINITY, 3, 2]],
    ['maxSpeed', [0, 10, Number.NaN, 2]],
    ['maxSpeed', [0, 10, Number.POSITIVE_INFINITY, 2]],
    ['maxSpeed', [0, 10, Number.NEGATIVE_INFINITY, 2]],
    ['elapsed', [0, 10, 3, Number.NaN]],
    ['elapsed', [0, 10, 3, Number.POSITIVE_INFINITY]],
    ['elapsed', [0, 10, 3, Number.NEGATIVE_INFINITY]],
  ] as const)('%s 위치의 non-finite 입력은 RangeError', (_name, [current, target, maxSpeed, elapsed]) => {
    expect(() => moveTowardByElapsed(current, target, maxSpeed, elapsed)).toThrow(RangeError);
  });

  test('overflow step은 RangeError', () => {
    expect(() => moveTowardByElapsed(0, 10, Number.MAX_VALUE, Number.MAX_VALUE)).toThrow(RangeError);
  });

  test('MoveTowardResult를 type으로 사용할 수 있다', () => {
    const result: MoveTowardResult = moveTowardByElapsed(0, 10, 3, 2);

    expect(result.reached).toBe(false);
  });
});
