/**
 * motion scalar kinematics helper(`finalVelocity`, `displacement`, `displacementFromVelocities`)
 * 단위 테스트.
 */

import { describe, expect, test } from 'vitest';
import { displacement } from '../../../src/motion/displacement';
import { displacementFromVelocities } from '../../../src/motion/displacement-from-velocities';
import { finalVelocity } from '../../../src/motion/final-velocity';

describe('finalVelocity', () => {
  test('v0 + a * t를 반환한다', () => {
    expect(finalVelocity(2, 3, 4)).toBe(14);
  });

  test('time < 0은 역방향 closed-form으로 평가한다', () => {
    expect(finalVelocity(2, 3, -1)).toBe(-1);
  });

  test('결과 -0은 0으로 canonicalize한다', () => {
    const result = finalVelocity(-0, -0, 1);

    expect(result).toBe(0);
    expect(Object.is(result, -0)).toBe(false);
  });

  test.each([
    ['initialVelocity', [Number.NaN, 3, 4]],
    ['initialVelocity', [Number.POSITIVE_INFINITY, 3, 4]],
    ['initialVelocity', [Number.NEGATIVE_INFINITY, 3, 4]],
    ['acceleration', [2, Number.NaN, 4]],
    ['acceleration', [2, Number.POSITIVE_INFINITY, 4]],
    ['acceleration', [2, Number.NEGATIVE_INFINITY, 4]],
    ['time', [2, 3, Number.NaN]],
    ['time', [2, 3, Number.POSITIVE_INFINITY]],
    ['time', [2, 3, Number.NEGATIVE_INFINITY]],
  ] as const)('%s 위치의 non-finite 입력은 RangeError', (_name, [v0, a, t]) => {
    expect(() => finalVelocity(v0, a, t)).toThrow(RangeError);
  });

  test('overflow 결과는 RangeError', () => {
    expect(() => finalVelocity(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE)).toThrow(RangeError);
  });
});

describe('displacement', () => {
  test('v0 * t + 0.5 * a * t^2를 반환한다', () => {
    expect(displacement(2, 3, 4)).toBe(32);
  });

  test('time < 0은 역방향 closed-form으로 평가한다', () => {
    expect(displacement(2, 3, -1)).toBe(-0.5);
  });

  test('결과 -0은 0으로 canonicalize한다', () => {
    const result = displacement(-0, -0, 5);

    expect(result).toBe(0);
    expect(Object.is(result, -0)).toBe(false);
  });

  test.each([
    ['initialVelocity', [Number.NaN, 3, 4]],
    ['initialVelocity', [Number.POSITIVE_INFINITY, 3, 4]],
    ['initialVelocity', [Number.NEGATIVE_INFINITY, 3, 4]],
    ['acceleration', [2, Number.NaN, 4]],
    ['acceleration', [2, Number.POSITIVE_INFINITY, 4]],
    ['acceleration', [2, Number.NEGATIVE_INFINITY, 4]],
    ['time', [2, 3, Number.NaN]],
    ['time', [2, 3, Number.POSITIVE_INFINITY]],
    ['time', [2, 3, Number.NEGATIVE_INFINITY]],
  ] as const)('%s 위치의 non-finite 입력은 RangeError', (_name, [v0, a, t]) => {
    expect(() => displacement(v0, a, t)).toThrow(RangeError);
  });

  test('overflow 결과는 RangeError', () => {
    expect(() => displacement(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE)).toThrow(RangeError);
  });

  test('finite 입력의 Infinity + (-Infinity) NaN 결과는 RangeError', () => {
    expect(() => displacement(-Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE)).toThrow(RangeError);
  });
});

describe('displacementFromVelocities', () => {
  test('(v0 + v1) * 0.5 * t를 반환한다', () => {
    expect(displacementFromVelocities(2, 14, 4)).toBe(32);
  });

  test('time < 0은 역방향 closed-form으로 평가한다', () => {
    expect(displacementFromVelocities(2, 14, -1)).toBe(-8);
  });

  test('결과 -0은 0으로 canonicalize한다', () => {
    const result = displacementFromVelocities(-0, -0, 5);

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
    expect(() => displacementFromVelocities(v0, v1, t)).toThrow(RangeError);
  });

  test('overflow 결과는 RangeError', () => {
    expect(() => displacementFromVelocities(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE)).toThrow(RangeError);
  });

  test('time === 0은 endpoint velocity 합이 overflow될 값이어도 0을 반환한다', () => {
    const result = displacementFromVelocities(Number.MAX_VALUE, Number.MAX_VALUE, 0);

    expect(result).toBe(0);
    expect(Object.is(result, -0)).toBe(false);
  });

  test('endpoint velocity 평균이 finite이면 합산 overflow 없이 계산한다', () => {
    expect(displacementFromVelocities(Number.MAX_VALUE, Number.MAX_VALUE, 0.5)).toBe(Number.MAX_VALUE / 2);
  });
});
