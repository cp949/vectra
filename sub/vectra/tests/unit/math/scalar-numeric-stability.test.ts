import { describe, expect, test } from 'vitest';
import { cosPi } from '../../../src/math/cos-pi';
import { sinPi } from '../../../src/math/sin-pi';
import { sinc } from '../../../src/math/sinc';
import { sqrt1pm1 } from '../../../src/math/sqrt1pm1';

const nonFiniteValues = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

describe('math numeric stability - sinPi', () => {
  test('integer zero는 +0을 반환한다', () => {
    expect(sinPi(0)).toBe(0);
    expect(Object.is(sinPi(0), 0)).toBe(true);
  });

  test('integer non-zero도 +0으로 canonicalize한다', () => {
    for (const x of [1, -1, 2, -2, 7, -42]) {
      expect(sinPi(x)).toBe(0);
      expect(Object.is(sinPi(x), 0)).toBe(true);
    }
  });

  test('half-integer 양수는 부호가 있는 ±1을 반환한다', () => {
    expect(sinPi(0.5)).toBe(1);
    expect(sinPi(1.5)).toBe(-1);
    expect(sinPi(2.5)).toBe(1);
    expect(sinPi(3.5)).toBe(-1);
  });

  test('half-integer 음수는 부호가 있는 ±1을 반환한다', () => {
    expect(sinPi(-0.5)).toBe(-1);
    expect(sinPi(-1.5)).toBe(1);
    expect(sinPi(-2.5)).toBe(-1);
    expect(sinPi(-3.5)).toBe(1);
  });

  test('일반 fraction은 reduced argument로 계산한다', () => {
    expect(sinPi(1 / 6)).toBeCloseTo(0.5, 14);
    expect(sinPi(1 / 3)).toBeCloseTo(Math.sqrt(3) / 2, 14);
    expect(sinPi(0.25)).toBeCloseTo(Math.SQRT1_2, 14);
  });

  test('negative input은 부호가 반전된다', () => {
    expect(sinPi(-1 / 6)).toBeCloseTo(-0.5, 14);
    expect(sinPi(-1 / 3)).toBeCloseTo(-Math.sqrt(3) / 2, 14);
  });

  test('큰 finite 정수는 정확한 +0을 유지한다', () => {
    expect(sinPi(Number.MAX_SAFE_INTEGER)).toBe(0);
    expect(Object.is(sinPi(Number.MAX_SAFE_INTEGER), 0)).toBe(true);
    expect(sinPi(-Number.MAX_SAFE_INTEGER)).toBe(0);
  });

  test('큰 magnitude fraction은 x % 2 reduce 결과로 계산한다', () => {
    // 100.25 % 2 === 0.25 → sinPi(0.25) === Math.SQRT1_2
    expect(sinPi(100.25)).toBeCloseTo(Math.SQRT1_2, 14);
    expect(sinPi(-100.25)).toBeCloseTo(-Math.SQRT1_2, 14);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => sinPi(value)).toThrow(RangeError);
  });
});

describe('math numeric stability - cosPi', () => {
  test('integer 짝수는 1을 반환한다', () => {
    expect(cosPi(0)).toBe(1);
    expect(cosPi(2)).toBe(1);
    expect(cosPi(-2)).toBe(1);
    expect(cosPi(4)).toBe(1);
  });

  test('integer 홀수는 -1을 반환한다', () => {
    expect(cosPi(1)).toBe(-1);
    expect(cosPi(-1)).toBe(-1);
    expect(cosPi(3)).toBe(-1);
    expect(cosPi(-3)).toBe(-1);
  });

  test('half-integer는 +0을 반환한다', () => {
    for (const x of [0.5, -0.5, 1.5, -1.5, 2.5, -2.5]) {
      expect(cosPi(x)).toBe(0);
      expect(Object.is(cosPi(x), 0)).toBe(true);
    }
  });

  test('일반 fraction은 reduced argument로 계산한다', () => {
    expect(cosPi(1 / 6)).toBeCloseTo(Math.sqrt(3) / 2, 14);
    expect(cosPi(1 / 3)).toBeCloseTo(0.5, 14);
    expect(cosPi(0.25)).toBeCloseTo(Math.SQRT1_2, 14);
  });

  test('cos는 우함수이므로 부호 반전에서 동일한 값을 반환한다', () => {
    expect(cosPi(-1 / 6)).toBeCloseTo(Math.sqrt(3) / 2, 14);
    expect(cosPi(-1 / 3)).toBeCloseTo(0.5, 14);
  });

  test('큰 finite 정수도 parity 기반 결과를 유지한다', () => {
    expect(cosPi(Number.MAX_SAFE_INTEGER)).toBe(-1);
    expect(cosPi(-Number.MAX_SAFE_INTEGER)).toBe(-1);
    expect(cosPi(2 ** 50)).toBe(1);
  });

  test('큰 magnitude fraction은 x % 2 reduce 결과로 계산한다', () => {
    // 100.25 % 2 === 0.25 → cosPi(0.25) === Math.SQRT1_2
    expect(cosPi(100.25)).toBeCloseTo(Math.SQRT1_2, 14);
    expect(cosPi(-100.25)).toBeCloseTo(Math.SQRT1_2, 14);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => cosPi(value)).toThrow(RangeError);
  });
});

describe('math numeric stability - sinc', () => {
  test('zero는 limit value 1을 반환한다', () => {
    expect(sinc(0)).toBe(1);
  });

  test('-0도 limit value 1을 반환한다', () => {
    expect(sinc(-0)).toBe(1);
  });

  test('integer non-zero에서는 +0을 반환한다', () => {
    expect(sinc(1)).toBe(0);
    expect(sinc(2)).toBe(0);
    expect(sinc(-3)).toBe(0);
    // negative integer는 denominator가 음수라 division 결과가 -0이 되므로 canonicalize 명시 검증.
    expect(Object.is(sinc(1), 0)).toBe(true);
    expect(Object.is(sinc(-1), 0)).toBe(true);
    expect(Object.is(sinc(-3), 0)).toBe(true);
  });

  test('half-integer에서는 부호가 있는 2/(πx)를 반환한다', () => {
    expect(sinc(0.5)).toBeCloseTo(2 / Math.PI, 14);
    expect(sinc(-0.5)).toBeCloseTo(2 / Math.PI, 14);
    expect(sinc(1.5)).toBeCloseTo(-2 / (3 * Math.PI), 14);
  });

  test('small magnitude에서도 1 근처 값을 안정적으로 반환한다', () => {
    // Math.sin(small) ≈ small이라 sin(πx)/(πx)는 1에 매우 가깝다.
    expect(sinc(1e-10)).toBeCloseTo(1, 14);
    expect(sinc(-1e-10)).toBeCloseTo(1, 14);
  });

  test('짝함수이므로 부호 반전에서 동일한 값을 반환한다', () => {
    expect(sinc(0.3)).toBeCloseTo(sinc(-0.3), 14);
  });

  test('Math.PI * x가 overflow되는 큰 finite x는 RangeError를 던진다', () => {
    expect(() => sinc(Number.MAX_VALUE)).toThrow(RangeError);
    expect(() => sinc(-Number.MAX_VALUE)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => sinc(value)).toThrow(RangeError);
  });
});

describe('math numeric stability - sqrt1pm1', () => {
  test('zero는 +0을 반환한다', () => {
    expect(sqrt1pm1(0)).toBe(0);
    expect(Object.is(sqrt1pm1(0), 0)).toBe(true);
  });

  test('-0도 +0으로 canonicalize한다', () => {
    expect(sqrt1pm1(-0)).toBe(0);
    expect(Object.is(sqrt1pm1(-0), 0)).toBe(true);
  });

  test('x === -1이면 exact -1을 반환한다', () => {
    expect(sqrt1pm1(-1)).toBe(-1);
    expect(Object.is(sqrt1pm1(-1), -1)).toBe(true);
  });

  test('-1보다 살짝 큰 finite 값은 일반 분기로 계산한다', () => {
    const x = -1 + 1e-15;
    const expected = x / (Math.sqrt(1 + x) + 1);
    expect(sqrt1pm1(x)).toBeCloseTo(expected, 14);
  });

  test('small positive는 cancellation 없이 정확한 근사값을 반환한다', () => {
    // sqrt(1 + 1e-16) - 1은 cancellation으로 0이 되지만 cancellation-safe 형은 x/2를 유지한다.
    const x = 1e-16;
    const naive = Math.sqrt(1 + x) - 1;
    const stable = sqrt1pm1(x);
    expect(stable).toBeCloseTo(x / 2, 30);
    expect(stable).toBeGreaterThan(0);
    expect(naive).toBe(0); // naive form은 cancellation으로 0이 된다 (회귀 방지).
  });

  test('small negative도 cancellation 없이 안정적이다', () => {
    const x = -1e-16;
    const stable = sqrt1pm1(x);
    expect(stable).toBeCloseTo(x / 2, 30);
    expect(stable).toBeLessThan(0);
  });

  test('일반 양수는 sqrt(1 + x) - 1과 같다', () => {
    expect(sqrt1pm1(3)).toBeCloseTo(1, 14);
    expect(sqrt1pm1(8)).toBeCloseTo(2, 14);
    expect(sqrt1pm1(15)).toBeCloseTo(3, 14);
  });

  test('x === -0.75는 음수 결과를 반환한다', () => {
    expect(sqrt1pm1(-0.75)).toBeCloseTo(Math.sqrt(0.25) - 1, 14);
  });

  test('x < -1이면 RangeError를 던진다', () => {
    expect(() => sqrt1pm1(-1.0001)).toThrow(RangeError);
    expect(() => sqrt1pm1(-2)).toThrow(RangeError);
    expect(() => sqrt1pm1(-Number.MAX_VALUE)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => sqrt1pm1(value)).toThrow(RangeError);
  });
});
