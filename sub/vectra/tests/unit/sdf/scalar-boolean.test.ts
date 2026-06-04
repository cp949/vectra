import { describe, expect, test } from 'vitest';
import { sdfIntersection } from '../../../src/sdf/sdf-intersection';
import { sdfSubtraction } from '../../../src/sdf/sdf-subtraction';
import { sdfUnion } from '../../../src/sdf/sdf-union';
import { NON_FINITE } from './_sdf-test-helpers';

describe('sdfUnion', () => {
  test('두 distance 중 작은 값을 반환한다', () => {
    expect(sdfUnion(3, 5)).toBe(3);
    expect(sdfUnion(-2, 4)).toBe(-2);
    expect(sdfUnion(-5, -1)).toBe(-5);
  });

  test('한쪽 shape 내부 point는 union 내부(음수)다', () => {
    // a 외부(3), b 내부(-2) → 한 곳에라도 속하면 union 내부 → min(3, -2) = -2
    expect(sdfUnion(3, -2)).toBe(-2);
  });

  test('boundary tie는 +0을 반환한다', () => {
    const result = sdfUnion(0, 5);
    expect(result).toBe(0);
    expect(Object.is(result, 0)).toBe(true);
  });

  test('-0 입력을 +0으로 정규화한다', () => {
    expect(Object.is(sdfUnion(-0, 5), 0)).toBe(true);
    expect(Object.is(sdfUnion(0, -0), 0)).toBe(true);
    expect(Object.is(sdfUnion(-0, -0), 0)).toBe(true);
  });

  test.each(NON_FINITE)('non-finite 첫 번째 입력 %p는 RangeError다', (bad) => {
    expect(() => sdfUnion(bad, 1)).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite 두 번째 입력 %p는 RangeError다', (bad) => {
    expect(() => sdfUnion(1, bad)).toThrow(RangeError);
  });
});

describe('sdfIntersection', () => {
  test('두 distance 중 큰 값을 반환한다', () => {
    expect(sdfIntersection(3, 5)).toBe(5);
    expect(sdfIntersection(-2, 4)).toBe(4);
    expect(sdfIntersection(-5, -1)).toBe(-1);
  });

  test('한쪽 shape 외부 point는 intersection 외부(양수)다', () => {
    // a 내부(-3), b 외부(2) → 둘 다에 속해야 intersection 내부 → max(-3, 2) = 2
    expect(sdfIntersection(-3, 2)).toBe(2);
  });

  test('boundary tie는 +0을 반환한다', () => {
    const result = sdfIntersection(0, -5);
    expect(result).toBe(0);
    expect(Object.is(result, 0)).toBe(true);
  });

  test('-0 입력을 +0으로 정규화한다', () => {
    expect(Object.is(sdfIntersection(-0, -5), 0)).toBe(true);
    expect(Object.is(sdfIntersection(-5, -0), 0)).toBe(true);
    expect(Object.is(sdfIntersection(-0, -0), 0)).toBe(true);
  });

  test.each(NON_FINITE)('non-finite 첫 번째 입력 %p는 RangeError다', (bad) => {
    expect(() => sdfIntersection(bad, 1)).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite 두 번째 입력 %p는 RangeError다', (bad) => {
    expect(() => sdfIntersection(1, bad)).toThrow(RangeError);
  });
});

describe('sdfSubtraction', () => {
  test('max(a, -b) 결과를 반환한다', () => {
    expect(sdfSubtraction(3, 5)).toBe(3);
    expect(sdfSubtraction(-2, -4)).toBe(4);
    expect(sdfSubtraction(1, 2)).toBe(1);
  });

  test('second shape 내부 point는 차집합 외부(양수)다', () => {
    // a 내부(-3), b 내부(-2) → A에서 B를 빼면 외부 → max(-3, 2) = 2
    expect(sdfSubtraction(-3, -2)).toBe(2);
  });

  test('second shape 외부 point는 first shape 부호를 유지한다', () => {
    // a 내부(-3), b 외부(4) → 차집합 내부 → max(-3, -4) = -3
    expect(sdfSubtraction(-3, 4)).toBe(-3);
  });

  test('second shape boundary는 +0 차집합 boundary를 만든다', () => {
    // a 내부(-3), b boundary(0) → max(-3, -0) = -0 → +0
    const result = sdfSubtraction(-3, 0);
    expect(result).toBe(0);
    expect(Object.is(result, 0)).toBe(true);
  });

  test('first shape boundary는 +0을 반환한다', () => {
    expect(Object.is(sdfSubtraction(0, 5), 0)).toBe(true);
    expect(Object.is(sdfSubtraction(-0, 5), 0)).toBe(true);
  });

  test('-0 second shape boundary는 +0 차집합 boundary를 만든다', () => {
    expect(Object.is(sdfSubtraction(-3, -0), 0)).toBe(true);
  });

  test.each(NON_FINITE)('non-finite 첫 번째 입력 %p는 RangeError다', (bad) => {
    expect(() => sdfSubtraction(bad, 1)).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite 두 번째 입력 %p는 RangeError다', (bad) => {
    expect(() => sdfSubtraction(1, bad)).toThrow(RangeError);
  });
});
