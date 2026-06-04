/**
 * cubic / cubicClamped — 3차 Bézier scalar 보간 unit test.
 *
 * 공식: (1-t)^3 * a + 3*(1-t)^2*t * b + 3*(1-t)*t^2 * c + t^3 * d
 * - cubic: t clamp 없이 extrapolation 허용
 * - cubicClamped: t를 [0, 1]로 clamp 후 계산
 */

import { describe, expect, test } from 'vitest';
import { cubic, cubicClamped } from '../../../src/interpolation/cubic';

const nonFiniteValues = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

describe('interpolation 3차 Bézier - cubic', () => {
  test('t=0에서 a를 반환한다', () => {
    expect(cubic(1, 3, 6, 9, 0)).toBe(1);
  });

  test('t=1에서 d를 반환한다', () => {
    expect(cubic(1, 3, 6, 9, 1)).toBe(9);
  });

  test('t=0.5에서 중간값을 반환한다', () => {
    // (0.5)^3*1 + 3*(0.5)^2*0.5*3 + 3*0.5*(0.5)^2*6 + (0.5)^3*9
    // = 0.125 + 3*0.25*0.5*3 + 3*0.5*0.25*6 + 0.125*9
    // = 0.125 + 1.125 + 2.25 + 1.125 = 4.625
    expect(cubic(1, 3, 6, 9, 0.5)).toBeCloseTo(4.625, 10);
  });

  test('제어점이 모두 같으면 상수를 반환한다', () => {
    // float64 누적 오차가 있으므로 toBeCloseTo로 검증한다
    expect(cubic(5, 5, 5, 5, 0.3)).toBeCloseTo(5, 10);
    expect(cubic(5, 5, 5, 5, 0.7)).toBeCloseTo(5, 10);
  });

  test('선형 보간 케이스: b=lerp(a,d,1/3), c=lerp(a,d,2/3)이면 t에 대해 선형', () => {
    // a=0, d=9 → b=3, c=6
    // t=0.5: (0.5)^3*0 + 3*0.25*0.5*3 + 3*0.5*0.25*6 + 0.125*9
    //       = 0 + 1.125 + 2.25 + 1.125 = 4.5 = lerp(0, 9, 0.5)
    expect(cubic(0, 3, 6, 9, 0.5)).toBeCloseTo(4.5, 10);
    expect(cubic(0, 3, 6, 9, 0.25)).toBeCloseTo(2.25, 10);
    expect(cubic(0, 3, 6, 9, 0.75)).toBeCloseTo(6.75, 10);
  });

  test('t를 clamp하지 않고 extrapolation을 허용한다', () => {
    // t=-1: (2)^3*a + 3*(2)^2*(-1)*b + 3*(2)*(-1)^2*c + (-1)^3*d
    //      = 8a - 12b + 6c - d
    // a=0, b=0, c=0, d=1, t=-1 → -1
    expect(cubic(0, 0, 0, 1, -1)).toBe(-1);
    // t=2: (−1)^3*0 + 3*(−1)^2*2*0 + 3*(−1)*4*0 + 8*1 = 8
    expect(cubic(0, 0, 0, 1, 2)).toBe(8);
  });

  test('음수 제어점을 올바르게 처리한다', () => {
    // a=0, b=-1, c=1, d=0, t=0.5
    // 0.125*0 + 3*0.25*0.5*(-1) + 3*0.5*0.25*1 + 0.125*0
    // = 0 - 0.375 + 0.375 + 0 = 0
    expect(cubic(0, -1, 1, 0, 0.5)).toBeCloseTo(0, 10);
  });

  test.each(nonFiniteValues)('finite하지 않은 a=%s는 RangeError를 던진다', (value) => {
    expect(() => cubic(value, 3, 6, 9, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 b=%s는 RangeError를 던진다', (value) => {
    expect(() => cubic(1, value, 6, 9, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 c=%s는 RangeError를 던진다', (value) => {
    expect(() => cubic(1, 3, value, 9, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 d=%s는 RangeError를 던진다', (value) => {
    expect(() => cubic(1, 3, 6, value, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 t=%s는 RangeError를 던진다', (value) => {
    expect(() => cubic(1, 3, 6, 9, value)).toThrow(RangeError);
  });
});

describe('interpolation 3차 Bézier - cubicClamped', () => {
  test('t=0에서 a를 반환한다', () => {
    expect(cubicClamped(1, 3, 6, 9, 0)).toBe(1);
  });

  test('t=1에서 d를 반환한다', () => {
    expect(cubicClamped(1, 3, 6, 9, 1)).toBe(9);
  });

  test('t=0.5에서 cubic과 동일한 결과를 반환한다', () => {
    expect(cubicClamped(1, 3, 6, 9, 0.5)).toBe(cubic(1, 3, 6, 9, 0.5));
  });

  test('t < 0이면 t=0으로 clamp하여 a를 반환한다', () => {
    expect(cubicClamped(1, 3, 6, 9, -0.5)).toBe(1);
    expect(cubicClamped(1, 3, 6, 9, -100)).toBe(1);
  });

  test('t > 1이면 t=1로 clamp하여 d를 반환한다', () => {
    expect(cubicClamped(1, 3, 6, 9, 1.5)).toBe(9);
    expect(cubicClamped(1, 3, 6, 9, 100)).toBe(9);
  });

  test('[0, 1] 범위 안의 t는 cubic과 동일한 결과를 반환한다', () => {
    for (const t of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
      expect(cubicClamped(0, 2, 8, 10, t)).toBe(cubic(0, 2, 8, 10, t));
    }
  });

  test.each(nonFiniteValues)('finite하지 않은 a=%s는 RangeError를 던진다', (value) => {
    expect(() => cubicClamped(value, 3, 6, 9, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 b=%s는 RangeError를 던진다', (value) => {
    expect(() => cubicClamped(1, value, 6, 9, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 c=%s는 RangeError를 던진다', (value) => {
    expect(() => cubicClamped(1, 3, value, 9, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 d=%s는 RangeError를 던진다', (value) => {
    expect(() => cubicClamped(1, 3, 6, value, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 t=%s는 RangeError를 던진다', (value) => {
    expect(() => cubicClamped(1, 3, 6, 9, value)).toThrow(RangeError);
  });
});
