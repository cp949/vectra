/**
 * hex-grid distance(hexDistance) 계약 테스트.
 *
 * same/adjacent/multi-step coordinate distance,
 * cube invariant 위반 RangeError, non-finite / non-integer / unsafe integer input RangeError,
 * 계산된 distance overflow RangeError, signed zero 없는 0 반환을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { hexDistance } from '../../../src/hex-grid/hex-distance';

describe('hexDistance - 두 hex coordinate 사이 grid distance', () => {
  test('같은 cube 좌표는 0이다', () => {
    expect(hexDistance({ q: 1, r: 2, s: -3 }, { q: 1, r: 2, s: -3 })).toBe(0);
  });

  test('인접한 cube 좌표는 1이다', () => {
    expect(hexDistance({ q: 0, r: 0, s: 0 }, { q: 1, r: 0, s: -1 })).toBe(1);
    expect(hexDistance({ q: 0, r: 0, s: 0 }, { q: 0, r: -1, s: 1 })).toBe(1);
  });

  test('multi-step positive/negative distance를 계산한다', () => {
    expect(hexDistance({ q: 0, r: 0, s: 0 }, { q: 3, r: -1, s: -2 })).toBe(3);
    expect(hexDistance({ q: -2, r: -3, s: 5 }, { q: 1, r: 1, s: -2 })).toBe(7);
  });

  test('cube invariant 위반은 RangeError다', () => {
    expect(() => hexDistance({ q: 1, r: 1, s: 1 }, { q: 0, r: 0, s: 0 })).toThrow(RangeError);
    expect(() => hexDistance({ q: 0, r: 0, s: 0 }, { q: 1, r: 2, s: 0 })).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    'non-finite/non-integer/unsafe axial q %s는 RangeError다',
    (q) => {
      expect(() => hexDistance({ q, r: 0, s: -q }, { q: 0, r: 0, s: 0 })).toThrow(RangeError);
    }
  );

  test('safe integer 입력이라도 계산된 distance가 unsafe integer면 RangeError다', () => {
    expect(() =>
      hexDistance(
        { q: Number.MAX_SAFE_INTEGER, r: 0, s: -Number.MAX_SAFE_INTEGER },
        { q: -Number.MAX_SAFE_INTEGER, r: 0, s: Number.MAX_SAFE_INTEGER }
      )
    ).toThrow(RangeError);
  });

  test('s가 빠진 axial 입력은 cube로 바꾸지 않고 RangeError다', () => {
    const axial = { q: 1, r: 0 };
    expect(() =>
      // @ts-expect-error hexDistance는 s가 있는 cube 좌표만 받는다.
      hexDistance(axial, { q: 0, r: 0, s: 0 })
    ).toThrow(RangeError);
  });

  test('반환값은 signed zero 없는 0이다', () => {
    expect(Object.is(hexDistance({ q: -1, r: 2, s: -1 }, { q: -1, r: 2, s: -1 }), 0)).toBe(true);
  });
});
