/**
 * cubicHermite / cubicHermiteClamped / tangentCardinal /
 * cubicHermiteFromPoints / cubicHermiteFromPointsClamped — Hermite/Cardinal scalar unit test.
 *
 * - cubicHermite: t clamp 없이 extrapolation 허용
 * - cubicHermiteClamped: t를 [0, 1]로 clamp 후 계산
 * - tangentCardinal: Cardinal tangent 공식 (1 - tension) * (next - prev) / 2
 * - cubicHermiteFromPoints: Cardinal tangent에서 a→b 구간 보간
 * - cubicHermiteFromPointsClamped: t를 [0, 1]로 clamp한 variant
 */

import { describe, expect, test } from 'vitest';
import {
  cubicHermite,
  cubicHermiteClamped,
  cubicHermiteFromPoints,
  cubicHermiteFromPointsClamped,
  tangentCardinal,
} from '../../../src/interpolation/hermite';

const nonFiniteValues = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

/**
 * hermite basis 공식으로 기대값을 직접 계산하는 helper.
 *
 * 구현체와 독립적으로 계산하여 cubicHermite / cubicHermiteClamped 결과 검증에 사용한다.
 */
function hermiteExpect(a: number, tangentA: number, b: number, tangentB: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;
  return h00 * a + h10 * tangentA + h01 * b + h11 * tangentB;
}

describe('interpolation Hermite - cubicHermite', () => {
  test('t=0에서 a를 반환한다', () => {
    expect(cubicHermite(2, 1, 5, 3, 0)).toBe(2);
  });

  test('t=1에서 b를 반환한다', () => {
    expect(cubicHermite(2, 1, 5, 3, 1)).toBe(5);
  });

  test('zero tangent에서 smooth endpoint interpolation을 반환한다', () => {
    // tangent가 0이면 h10 * 0 + h11 * 0 = 0, h00 * a + h01 * b만 남는다
    const result = cubicHermite(0, 0, 1, 0, 0.5);
    // h00(0.5)=0.5, h01(0.5)=0.5 → 0.5 * 0 + 0.5 * 1 = 0.5
    expect(result).toBeCloseTo(0.5, 10);
  });

  test('t=0.5에서 기대값을 반환한다', () => {
    const result = cubicHermite(1, 2, 4, 1, 0.5);
    expect(result).toBeCloseTo(hermiteExpect(1, 2, 4, 1, 0.5), 10);
  });

  test('t < 0 extrapolation을 허용한다', () => {
    // 에러 없이 실행되어야 한다
    expect(() => cubicHermite(0, 1, 1, 1, -0.5)).not.toThrow();
    expect(cubicHermite(0, 1, 1, 1, -0.5)).toBeCloseTo(hermiteExpect(0, 1, 1, 1, -0.5), 10);
  });

  test('t > 1 extrapolation을 허용한다', () => {
    expect(() => cubicHermite(0, 1, 1, 1, 1.5)).not.toThrow();
    expect(cubicHermite(0, 1, 1, 1, 1.5)).toBeCloseTo(hermiteExpect(0, 1, 1, 1, 1.5), 10);
  });

  test('음수 tangent를 올바르게 처리한다', () => {
    const result = cubicHermite(0, -1, 1, -1, 0.5);
    expect(result).toBeCloseTo(hermiteExpect(0, -1, 1, -1, 0.5), 10);
  });

  test.each(nonFiniteValues)('finite하지 않은 a=%s는 RangeError를 던진다', (value) => {
    expect(() => cubicHermite(value, 1, 5, 1, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 tangentA=%s는 RangeError를 던진다', (value) => {
    expect(() => cubicHermite(2, value, 5, 1, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 b=%s는 RangeError를 던진다', (value) => {
    expect(() => cubicHermite(2, 1, value, 1, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 tangentB=%s는 RangeError를 던진다', (value) => {
    expect(() => cubicHermite(2, 1, 5, value, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 t=%s는 RangeError를 던진다', (value) => {
    expect(() => cubicHermite(2, 1, 5, 1, value)).toThrow(RangeError);
  });
});

describe('interpolation Hermite - cubicHermiteClamped', () => {
  test('t=0에서 a를 반환한다', () => {
    expect(cubicHermiteClamped(2, 1, 5, 3, 0)).toBe(2);
  });

  test('t=1에서 b를 반환한다', () => {
    expect(cubicHermiteClamped(2, 1, 5, 3, 1)).toBe(5);
  });

  test('t < 0이면 t=0으로 clamp하여 a를 반환한다', () => {
    expect(cubicHermiteClamped(2, 1, 5, 3, -0.5)).toBe(2);
    expect(cubicHermiteClamped(2, 1, 5, 3, -100)).toBe(2);
  });

  test('t > 1이면 t=1로 clamp하여 b를 반환한다', () => {
    expect(cubicHermiteClamped(2, 1, 5, 3, 1.5)).toBe(5);
    expect(cubicHermiteClamped(2, 1, 5, 3, 100)).toBe(5);
  });

  test('[0, 1] 범위 안의 t는 cubicHermite와 동일한 결과를 반환한다', () => {
    for (const t of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
      expect(cubicHermiteClamped(1, 2, 4, 1, t)).toBe(cubicHermite(1, 2, 4, 1, t));
    }
  });

  test('value result를 clamp하지 않는다', () => {
    // tangent가 크면 [a, b] 밖의 값이 나올 수 있다
    const result = cubicHermiteClamped(0, 10, 1, 10, 0.5);
    // 결과는 [0, 1] 밖일 수 있다
    expect(result).toBeCloseTo(hermiteExpect(0, 10, 1, 10, 0.5), 10);
  });

  test.each(nonFiniteValues)('finite하지 않은 a=%s는 RangeError를 던진다', (value) => {
    expect(() => cubicHermiteClamped(value, 1, 5, 1, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 tangentA=%s는 RangeError를 던진다', (value) => {
    expect(() => cubicHermiteClamped(2, value, 5, 1, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 b=%s는 RangeError를 던진다', (value) => {
    expect(() => cubicHermiteClamped(2, 1, value, 1, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 tangentB=%s는 RangeError를 던진다', (value) => {
    expect(() => cubicHermiteClamped(2, 1, 5, value, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 t=%s는 RangeError를 던진다', (value) => {
    expect(() => cubicHermiteClamped(2, 1, 5, 1, value)).toThrow(RangeError);
  });
});

describe('interpolation Cardinal tangent - tangentCardinal', () => {
  test('tension 0 기본값: (next - prev) / 2를 반환한다', () => {
    expect(tangentCardinal(1, 5)).toBe(2);
    expect(tangentCardinal(0, 4)).toBe(2);
    expect(tangentCardinal(-2, 2)).toBe(2);
  });

  test('tension 0 명시: 기본값과 동일하다', () => {
    expect(tangentCardinal(1, 5, { tension: 0 })).toBe(2);
  });

  test('tension 1: 0을 반환한다', () => {
    expect(tangentCardinal(1, 5, { tension: 1 })).toBe(0);
    expect(tangentCardinal(-3, 7, { tension: 1 })).toBe(0);
  });

  test('tension 0.5: (0.5 * (next - prev)) / 2를 반환한다', () => {
    // (1 - 0.5) * (5 - 1) / 2 = 0.5 * 4 / 2 = 1
    expect(tangentCardinal(1, 5, { tension: 0.5 })).toBe(1);
  });

  test('prev === next이면 0을 반환한다', () => {
    expect(tangentCardinal(3, 3)).toBe(0);
  });

  test('tension < 0이면 RangeError를 던진다', () => {
    expect(() => tangentCardinal(1, 5, { tension: -0.1 })).toThrow(RangeError);
    expect(() => tangentCardinal(1, 5, { tension: -1 })).toThrow(RangeError);
  });

  test('tension > 1이면 RangeError를 던진다', () => {
    expect(() => tangentCardinal(1, 5, { tension: 1.1 })).toThrow(RangeError);
    expect(() => tangentCardinal(1, 5, { tension: 2 })).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 tension=%s는 RangeError를 던진다', (value) => {
    expect(() => tangentCardinal(1, 5, { tension: value })).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 prev=%s는 RangeError를 던진다', (value) => {
    expect(() => tangentCardinal(value, 5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 next=%s는 RangeError를 던진다', (value) => {
    expect(() => tangentCardinal(1, value)).toThrow(RangeError);
  });
});

describe('interpolation Hermite from points - cubicHermiteFromPoints', () => {
  test('t=0에서 a를 반환한다', () => {
    expect(cubicHermiteFromPoints(0, 1, 4, 6, 0)).toBe(1);
  });

  test('t=1에서 b를 반환한다', () => {
    expect(cubicHermiteFromPoints(0, 1, 4, 6, 1)).toBe(4);
  });

  test('Cardinal tangent를 사용한 cubicHermite 결과와 일치한다', () => {
    const prev = 0;
    const a = 1;
    const b = 4;
    const next = 6;
    const t = 0.5;
    const tangentA = tangentCardinal(prev, b);
    const tangentB = tangentCardinal(a, next);
    const expected = cubicHermite(a, tangentA, b, tangentB, t);
    expect(cubicHermiteFromPoints(prev, a, b, next, t)).toBeCloseTo(expected, 10);
  });

  test('tension 옵션이 Cardinal tangent에 전달된다', () => {
    const prev = 0;
    const a = 1;
    const b = 4;
    const next = 6;
    const t = 0.5;
    const options = { tension: 0.5 };
    const tangentA = tangentCardinal(prev, b, options);
    const tangentB = tangentCardinal(a, next, options);
    const expected = cubicHermite(a, tangentA, b, tangentB, t);
    expect(cubicHermiteFromPoints(prev, a, b, next, t, options)).toBeCloseTo(expected, 10);
  });

  test('t < 0 extrapolation을 허용한다', () => {
    expect(() => cubicHermiteFromPoints(0, 1, 4, 6, -0.5)).not.toThrow();
  });

  test('t > 1 extrapolation을 허용한다', () => {
    expect(() => cubicHermiteFromPoints(0, 1, 4, 6, 1.5)).not.toThrow();
  });

  test.each(nonFiniteValues)('finite하지 않은 t=%s는 RangeError를 던진다', (value) => {
    expect(() => cubicHermiteFromPoints(0, 1, 4, 6, value)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 prev=%s는 RangeError를 던진다', (value) => {
    expect(() => cubicHermiteFromPoints(value, 1, 4, 6, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 a=%s는 RangeError를 던진다', (value) => {
    expect(() => cubicHermiteFromPoints(0, value, 4, 6, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 b=%s는 RangeError를 던진다', (value) => {
    expect(() => cubicHermiteFromPoints(0, 1, value, 6, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 next=%s는 RangeError를 던진다', (value) => {
    expect(() => cubicHermiteFromPoints(0, 1, 4, value, 0.5)).toThrow(RangeError);
  });
});

describe('interpolation Hermite from points - cubicHermiteFromPointsClamped', () => {
  test('t=0에서 a를 반환한다', () => {
    expect(cubicHermiteFromPointsClamped(0, 1, 4, 6, 0)).toBe(1);
  });

  test('t=1에서 b를 반환한다', () => {
    expect(cubicHermiteFromPointsClamped(0, 1, 4, 6, 1)).toBe(4);
  });

  test('t < 0이면 a를 반환한다', () => {
    expect(cubicHermiteFromPointsClamped(0, 1, 4, 6, -0.5)).toBe(1);
    expect(cubicHermiteFromPointsClamped(0, 1, 4, 6, -100)).toBe(1);
  });

  test('t > 1이면 b를 반환한다', () => {
    expect(cubicHermiteFromPointsClamped(0, 1, 4, 6, 1.5)).toBe(4);
    expect(cubicHermiteFromPointsClamped(0, 1, 4, 6, 100)).toBe(4);
  });

  test('[0, 1] 범위 안의 t는 cubicHermiteFromPoints와 동일한 결과를 반환한다', () => {
    for (const t of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
      expect(cubicHermiteFromPointsClamped(0, 1, 4, 6, t)).toBe(cubicHermiteFromPoints(0, 1, 4, 6, t));
    }
  });

  test.each(nonFiniteValues)('finite하지 않은 t=%s는 RangeError를 던진다', (value) => {
    expect(() => cubicHermiteFromPointsClamped(0, 1, 4, 6, value)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 prev=%s는 RangeError를 던진다', (value) => {
    expect(() => cubicHermiteFromPointsClamped(value, 1, 4, 6, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 a=%s는 RangeError를 던진다', (value) => {
    expect(() => cubicHermiteFromPointsClamped(0, value, 4, 6, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 b=%s는 RangeError를 던진다', (value) => {
    expect(() => cubicHermiteFromPointsClamped(0, 1, value, 6, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 next=%s는 RangeError를 던진다', (value) => {
    expect(() => cubicHermiteFromPointsClamped(0, 1, 4, value, 0.5)).toThrow(RangeError);
  });
});
