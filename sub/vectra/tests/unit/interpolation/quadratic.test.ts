/**
 * quadratic / quadraticClamped — 2차 Bézier scalar 보간 unit test.
 *
 * 공식: (1-t)^2 * a + 2*(1-t)*t * b + t^2 * c
 * - quadratic: t clamp 없이 extrapolation 허용
 * - quadraticClamped: t를 [0, 1]로 clamp 후 계산
 */

import { describe, expect, test } from 'vitest';
import { quadratic, quadraticClamped } from '../../../src/interpolation/quadratic';

const nonFiniteValues = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

describe('interpolation 2차 Bézier - quadratic', () => {
  test('t=0에서 a를 반환한다', () => {
    expect(quadratic(1, 5, 9, 0)).toBe(1);
  });

  test('t=1에서 c를 반환한다', () => {
    expect(quadratic(1, 5, 9, 1)).toBe(9);
  });

  test('t=0.5에서 중간값을 반환한다', () => {
    // (0.5)^2*1 + 2*0.5*0.5*5 + (0.5)^2*9 = 0.25 + 2.5 + 2.25 = 5
    expect(quadratic(1, 5, 9, 0.5)).toBe(5);
  });

  test('제어점이 곡선에 영향을 준다', () => {
    // a=0, b=10, c=0, t=0.5 → 0.25*0 + 2*0.5*0.5*10 + 0.25*0 = 5
    expect(quadratic(0, 10, 0, 0.5)).toBe(5);
    // a=0, b=0, c=0, t=0.5 → 0
    expect(quadratic(0, 0, 0, 0.5)).toBe(0);
  });

  test('제어점이 0인 직선 보간과 일치한다', () => {
    // b가 lerp(a, c, 0.5)이면 quadratic은 선형 보간과 같다
    // a=0, b=5, c=10, t=0.5 → (0.25)*0 + 2*0.25*5 + 0.25*10 = 0 + 2.5 + 2.5 = 5
    expect(quadratic(0, 5, 10, 0.5)).toBe(5);
  });

  test('t를 clamp하지 않고 extrapolation을 허용한다', () => {
    // t=-1: (1-(-1))^2*a + 2*(1-(-1))*(-1)*b + (-1)^2*c = 4a - 4b + c
    expect(quadratic(0, 0, 1, -1)).toBe(1);
    // t=2: (1-2)^2*0 + 2*(1-2)*2*0 + (2)^2*1 = 0 + 0 + 4 = 4
    expect(quadratic(0, 0, 1, 2)).toBe(4);
  });

  test('음수 값과 소수값을 올바르게 처리한다', () => {
    // a=-1, b=0, c=1, t=0.5 → 0.25*(-1) + 0 + 0.25*1 = 0
    expect(quadratic(-1, 0, 1, 0.5)).toBe(0);
  });

  test.each(nonFiniteValues)('finite하지 않은 a=%s는 RangeError를 던진다', (value) => {
    expect(() => quadratic(value, 5, 9, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 b=%s는 RangeError를 던진다', (value) => {
    expect(() => quadratic(1, value, 9, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 c=%s는 RangeError를 던진다', (value) => {
    expect(() => quadratic(1, 5, value, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 t=%s는 RangeError를 던진다', (value) => {
    expect(() => quadratic(1, 5, 9, value)).toThrow(RangeError);
  });
});

describe('interpolation 2차 Bézier - quadraticClamped', () => {
  test('t=0에서 a를 반환한다', () => {
    expect(quadraticClamped(1, 5, 9, 0)).toBe(1);
  });

  test('t=1에서 c를 반환한다', () => {
    expect(quadraticClamped(1, 5, 9, 1)).toBe(9);
  });

  test('t=0.5에서 quadratic과 동일한 결과를 반환한다', () => {
    expect(quadraticClamped(1, 5, 9, 0.5)).toBe(quadratic(1, 5, 9, 0.5));
  });

  test('t < 0이면 t=0으로 clamp하여 a를 반환한다', () => {
    expect(quadraticClamped(1, 5, 9, -0.5)).toBe(1);
    expect(quadraticClamped(1, 5, 9, -100)).toBe(1);
  });

  test('t > 1이면 t=1로 clamp하여 c를 반환한다', () => {
    expect(quadraticClamped(1, 5, 9, 1.5)).toBe(9);
    expect(quadraticClamped(1, 5, 9, 100)).toBe(9);
  });

  test('[0, 1] 범위 안의 t는 quadratic과 동일한 결과를 반환한다', () => {
    for (const t of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
      expect(quadraticClamped(0, 10, 4, t)).toBe(quadratic(0, 10, 4, t));
    }
  });

  test.each(nonFiniteValues)('finite하지 않은 a=%s는 RangeError를 던진다', (value) => {
    expect(() => quadraticClamped(value, 5, 9, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 b=%s는 RangeError를 던진다', (value) => {
    expect(() => quadraticClamped(1, value, 9, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 c=%s는 RangeError를 던진다', (value) => {
    expect(() => quadraticClamped(1, 5, value, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 t=%s는 RangeError를 던진다', (value) => {
    expect(() => quadraticClamped(1, 5, 9, value)).toThrow(RangeError);
  });
});
