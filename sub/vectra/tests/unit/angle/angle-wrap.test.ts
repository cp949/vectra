/**
 * angle domain radian/degree wrap 경계와 non-finite 거부를 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { wrapDegrees } from '../../../src/angle/wrap-degrees';
import { wrapDegreesPositive } from '../../../src/angle/wrap-degrees-positive';
import { wrapRadians } from '../../../src/angle/wrap-radians';
import { wrapRadiansPositive } from '../../../src/angle/wrap-radians-positive';
import { nonFiniteValues } from './_fixtures/angle-fixtures';

describe('angle wrap - wrapRadians (범위 [-π, π))', () => {
  test('Math.PI는 -Math.PI로 감긴다', () => {
    expect(wrapRadians(Math.PI)).toBe(-Math.PI);
  });

  test('-Math.PI는 -Math.PI 그대로다', () => {
    expect(wrapRadians(-Math.PI)).toBe(-Math.PI);
  });

  test('0은 0 그대로다', () => {
    expect(wrapRadians(0)).toBe(0);
  });

  test('π/2는 π/2 그대로다', () => {
    expect(wrapRadians(Math.PI / 2)).toBeCloseTo(Math.PI / 2, 10);
  });

  test('3π는 -π로 감긴다', () => {
    expect(wrapRadians(3 * Math.PI)).toBe(-Math.PI);
  });

  test('2π는 0으로 감긴다', () => {
    // 2π → wrapFloatHalfOpen(2π, -π, π) = -π + positiveModulo(3π, 2π) = -π + π = 0
    expect(wrapRadians(2 * Math.PI)).toBeCloseTo(0, 10);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => wrapRadians(value)).toThrow(RangeError);
  });
});

describe('angle wrap - wrapRadiansPositive (범위 [0, 2π))', () => {
  test('-Math.PI는 Math.PI로 감긴다', () => {
    expect(wrapRadiansPositive(-Math.PI)).toBeCloseTo(Math.PI, 10);
  });

  test('2π는 0으로 감긴다', () => {
    expect(wrapRadiansPositive(2 * Math.PI)).toBe(0);
  });

  test('0은 0 그대로다', () => {
    expect(wrapRadiansPositive(0)).toBe(0);
  });

  test('π는 π 그대로다', () => {
    expect(wrapRadiansPositive(Math.PI)).toBeCloseTo(Math.PI, 10);
  });

  test('-2π는 0으로 감긴다', () => {
    expect(wrapRadiansPositive(-2 * Math.PI)).toBe(0);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => wrapRadiansPositive(value)).toThrow(RangeError);
  });
});

describe('angle wrap - wrapDegrees (범위 [-180, 180))', () => {
  test('180은 -180으로 감긴다', () => {
    expect(wrapDegrees(180)).toBe(-180);
  });

  test('-180은 -180 그대로다', () => {
    expect(wrapDegrees(-180)).toBe(-180);
  });

  test('0은 0 그대로다', () => {
    expect(wrapDegrees(0)).toBe(0);
  });

  test('90은 90 그대로다', () => {
    expect(wrapDegrees(90)).toBe(90);
  });

  test('540은 -180으로 감긴다', () => {
    expect(wrapDegrees(540)).toBe(-180);
  });

  test('360은 0으로 감긴다', () => {
    expect(wrapDegrees(360)).toBe(0);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => wrapDegrees(value)).toThrow(RangeError);
  });
});

describe('angle wrap - wrapDegreesPositive (범위 [0, 360))', () => {
  test('-180은 180으로 감긴다', () => {
    expect(wrapDegreesPositive(-180)).toBe(180);
  });

  test('360은 0으로 감긴다', () => {
    expect(wrapDegreesPositive(360)).toBe(0);
  });

  test('0은 0 그대로다', () => {
    expect(wrapDegreesPositive(0)).toBe(0);
  });

  test('270은 270 그대로다', () => {
    expect(wrapDegreesPositive(270)).toBe(270);
  });

  test('-360은 0으로 감긴다', () => {
    expect(wrapDegreesPositive(-360)).toBe(0);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => wrapDegreesPositive(value)).toThrow(RangeError);
  });
});
