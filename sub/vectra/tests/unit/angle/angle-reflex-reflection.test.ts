/**
 * angle domain single-angle reflex 판정과 raw scalar reflection helper를 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { isReflex } from '../../../src/angle/is-reflex';
import { reflectAngle } from '../../../src/angle/reflect-angle';
import { nonFiniteValues } from './_fixtures/angle-fixtures';

describe('isReflex - 단일 angle reflex 판정', () => {
  test('acute angle은 reflex가 아니다', () => {
    expect(isReflex(Math.PI / 4)).toBe(false);
  });

  test('obtuse angle은 reflex가 아니다 (π 미만)', () => {
    expect(isReflex((3 * Math.PI) / 4)).toBe(false);
  });

  test('정확히 0은 reflex가 아니다', () => {
    expect(isReflex(0)).toBe(false);
  });

  test('정확히 π는 reflex가 아니다 (경계값)', () => {
    expect(isReflex(Math.PI)).toBe(false);
  });

  test('정확히 2π는 reflex가 아니다 (wrapRadiansPositive(2π) === 0)', () => {
    expect(isReflex(2 * Math.PI)).toBe(false);
  });

  test('π를 약간 초과하면 reflex이다', () => {
    // Math.PI는 [2, 4) 구간이므로 ULP는 2 * Number.EPSILON이다.
    // float64에서 실제로 Math.PI보다 큰 값을 만들어 경계 직후를 검증한다.
    const justOverPi = Math.PI + 2 * Number.EPSILON;
    expect(justOverPi).toBeGreaterThan(Math.PI);
    expect(isReflex(justOverPi)).toBe(true);
  });

  test('3π/2는 reflex이다', () => {
    expect(isReflex((3 * Math.PI) / 2)).toBe(true);
  });

  test('2π 직전 ULP는 reflex이다 (경계 직전)', () => {
    // 2 * Math.PI는 [4, 8) 구간이므로 ULP는 4 * Number.EPSILON이다.
    // float64에서 실제로 2π보다 작은 인접 값으로 경계 직전을 검증한다.
    const justBefore2Pi = 2 * Math.PI - 4 * Number.EPSILON;
    expect(justBefore2Pi).toBeLessThan(2 * Math.PI);
    expect(isReflex(justBefore2Pi)).toBe(true);
  });

  test('-π/2는 reflex이다 (wrapRadiansPositive(-π/2) === 3π/2)', () => {
    expect(isReflex(-Math.PI / 2)).toBe(true);
  });

  test('-π/4는 reflex이다 (wrapRadiansPositive(-π/4) === 7π/4)', () => {
    expect(isReflex(-Math.PI / 4)).toBe(true);
  });

  test('-π는 reflex가 아니다 (wrapRadiansPositive(-π) === π)', () => {
    expect(isReflex(-Math.PI)).toBe(false);
  });

  test('5π/2(=2π+π/2)는 reflex가 아니다 (wrap 후 π/2)', () => {
    expect(isReflex((5 * Math.PI) / 2)).toBe(false);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => isReflex(value)).toThrow(RangeError);
  });
});

describe('reflectAngle - axis 기준 angle scalar 반사', () => {
  test('π/6을 π/2 축으로 반사하면 5π/6이다', () => {
    expect(reflectAngle(Math.PI / 6, Math.PI / 2)).toBeCloseTo((5 * Math.PI) / 6, 10);
  });

  test('축이 0이면 angle 부호를 뒤집는다', () => {
    expect(reflectAngle(Math.PI / 4, 0)).toBeCloseTo(-Math.PI / 4, 10);
  });

  test('angle === axisAngle이면 결과는 axisAngle이다 (자기 반사 고정점)', () => {
    // 2 * x - x === x는 IEEE 754 round-to-nearest에서 representable 그대로 보존된다.
    expect(reflectAngle(Math.PI / 3, Math.PI / 3)).toBe(Math.PI / 3);
  });

  test('negative axis도 동일 공식을 따른다', () => {
    // 2 * (-π/4) - π/2 = -π
    expect(reflectAngle(Math.PI / 2, -Math.PI / 4)).toBeCloseTo(-Math.PI, 10);
  });

  test('결과를 [0, 2π)로 normalize하지 않는다', () => {
    // 2 * 2π - 0 = 4π. wrap되지 않은 raw 결과를 그대로 반환한다.
    expect(reflectAngle(0, 2 * Math.PI)).toBe(4 * Math.PI);
  });

  test('큰 음수 결과도 normalize 없이 반환한다', () => {
    // 2 * (-10π) - 0 = -20π
    expect(reflectAngle(0, -10 * Math.PI)).toBe(-20 * Math.PI);
  });

  test.each([
    [0.7, -1.3],
    [2.5, 10],
    [-1.7, -0.3],
    [Math.PI / 4, Math.PI],
  ])('reflection은 self-inverse이다: angle=%f axis=%f', (angle, axis) => {
    expect(reflectAngle(reflectAngle(angle, axis), axis)).toBeCloseTo(angle, 10);
  });

  test('finite 입력의 overflow는 RangeError를 던진다', () => {
    // 2 * 1e308 - (-1e308) = 3e308 → Infinity
    expect(() => reflectAngle(-1e308, 1e308)).toThrow(RangeError);
  });

  test('finite 입력의 negative overflow도 RangeError를 던진다', () => {
    // 2 * (-1e308) - 1e308 = -3e308 → -Infinity
    expect(() => reflectAngle(1e308, -1e308)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('angle이 finite하지 않으면 RangeError를 던진다: %s', (value) => {
    expect(() => reflectAngle(value, 0)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('axisAngle이 finite하지 않으면 RangeError를 던진다: %s', (value) => {
    expect(() => reflectAngle(0, value)).toThrow(RangeError);
  });
});
