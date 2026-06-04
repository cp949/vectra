/**
 * hex-grid distance(hexDistance) 계약 테스트.
 *
 * same/adjacent/multi-step coordinate distance, axial·cube input 혼합 동일 결과, tuple/object input,
 * cube invariant 위반 RangeError, non-finite / non-integer / unsafe integer input RangeError,
 * 계산된 distance overflow RangeError, signed zero 없는 0 반환을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { hexDistance } from '../../../src/hex-grid/hex-distance';

describe('hexDistance - 두 hex coordinate 사이 grid distance', () => {
  test('same axial coordinate는 0이다', () => {
    expect(hexDistance({ q: 1, r: 2 }, { q: 1, r: 2 })).toBe(0);
  });

  test('adjacent axial coordinate는 1이다', () => {
    expect(hexDistance({ q: 0, r: 0 }, { q: 1, r: 0 })).toBe(1);
    expect(hexDistance({ q: 0, r: 0 }, { q: 0, r: -1 })).toBe(1);
  });

  test('multi-step positive/negative distance를 계산한다', () => {
    expect(hexDistance({ q: 0, r: 0 }, { q: 3, r: -1 })).toBe(3);
    expect(hexDistance({ q: -2, r: -3 }, { q: 1, r: 1 })).toBe(7);
  });

  test('axial input과 cube input을 혼합해도 같은 결과를 반환한다', () => {
    expect(hexDistance({ q: 0, r: 0 }, { q: 3, r: -1, s: -2 })).toBe(3);
    expect(hexDistance([0, 0, 0], { q: 3, r: -1 })).toBe(3);
    expect(hexDistance([-2, -3], [1, 1, -2])).toBe(7);
  });

  test('cube invariant 위반은 RangeError다', () => {
    expect(() => hexDistance({ q: 1, r: 1, s: 1 }, { q: 0, r: 0 })).toThrow(RangeError);
    expect(() => hexDistance({ q: 0, r: 0 }, [1, 2, 0])).toThrow(RangeError);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    1.5,
    Number.MAX_SAFE_INTEGER + 1,
  ])('non-finite/non-integer/unsafe axial q %s는 RangeError다', (q) => {
    expect(() => hexDistance({ q, r: 0 }, { q: 0, r: 0 })).toThrow(RangeError);
  });

  test('safe integer 입력이라도 계산된 distance가 unsafe integer면 RangeError다', () => {
    expect(() => hexDistance({ q: Number.MAX_SAFE_INTEGER, r: 0 }, { q: -Number.MAX_SAFE_INTEGER, r: 0 })).toThrow(
      RangeError
    );
  });

  test('반환값은 signed zero 없는 0이다', () => {
    expect(Object.is(hexDistance({ q: -1, r: 2 }, { q: -1, r: 2 }), 0)).toBe(true);
  });
});
