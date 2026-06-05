/**
 * hex-grid coordinate conversion(hexAxialToCube / hexCubeToAxial) 계약 테스트.
 *
 * object/tuple axial·cube input 변환, negative coordinate의 `q + r + s === 0` invariant,
 * cube invariant 위반 RangeError, non-finite / non-integer / unsafe integer input RangeError,
 * 계산된 s overflow RangeError, companion plain object 반환을 검증한다.
 *
 * offset conversion(hexAxialToOffset / hexOffsetToAxial)은 4개 layout의 axial → offset → axial
 * round-trip, negative parity case, tuple/object input, invalid layout RangeError,
 * non-finite / non-integer / unsafe integer input RangeError, 계산된 col/row overflow RangeError를
 * 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { hexAxialToCube } from '../../../src/hex-grid/hex-axial-to-cube';
import { hexAxialToOffset } from '../../../src/hex-grid/hex-axial-to-offset';
import { hexCubeToAxial } from '../../../src/hex-grid/hex-cube-to-axial';
import { hexOffsetToAxial } from '../../../src/hex-grid/hex-offset-to-axial';
import type { HexOffsetLayout } from '../../../src/types';

describe('hexAxialToCube - axial을 cube로 변환', () => {
  test('object axial을 { q, r, s }로 변환한다', () => {
    expect(hexAxialToCube({ q: 1, r: 2 })).toEqual({ q: 1, r: 2, s: -3 });
  });

  test('tuple axial을 object axial과 동일하게 변환한다', () => {
    expect(hexAxialToCube([1, 2])).toEqual({ q: 1, r: 2, s: -3 });
  });

  test('negative coordinate에서도 q + r + s === 0을 만족한다', () => {
    const cube = hexAxialToCube({ q: -4, r: 3 });
    expect(cube).toEqual({ q: -4, r: 3, s: 1 });
    expect(cube.q + cube.r + cube.s).toBe(0);
  });

  test('새 plain object를 반환한다', () => {
    const result = hexAxialToCube([0, 0]);
    expect(result).toEqual({ q: 0, r: 0, s: 0 });
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    1.5,
    Number.MAX_SAFE_INTEGER + 1,
  ])('non-finite/non-integer/unsafe axial q %s는 RangeError다', (q) => {
    expect(() => hexAxialToCube({ q, r: 0 })).toThrow(RangeError);
  });

  test('safe integer q/r이라도 계산된 s가 unsafe integer면 RangeError다', () => {
    expect(() => hexAxialToCube({ q: Number.MAX_SAFE_INTEGER, r: Number.MAX_SAFE_INTEGER })).toThrow(RangeError);
  });
});

describe('hexCubeToAxial - cube를 axial로 변환', () => {
  test('object cube를 { q, r }로 변환한다', () => {
    expect(hexCubeToAxial({ q: 1, r: 2, s: -3 })).toEqual({ q: 1, r: 2 });
  });

  test('tuple cube를 object cube와 동일하게 변환한다', () => {
    expect(hexCubeToAxial([1, 2, -3])).toEqual({ q: 1, r: 2 });
  });

  test('negative coordinate cube를 변환한다', () => {
    expect(hexCubeToAxial([-4, 3, 1])).toEqual({ q: -4, r: 3 });
  });

  test('새 plain object를 반환한다', () => {
    const result = hexCubeToAxial([0, 0, 0]);
    expect(result).toEqual({ q: 0, r: 0 });
  });

  test('q + r + s !== 0이면 RangeError다', () => {
    expect(() => hexCubeToAxial({ q: 1, r: 1, s: 1 })).toThrow(RangeError);
    expect(() => hexCubeToAxial([1, 2, 0])).toThrow(RangeError);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    1.5,
    Number.MAX_SAFE_INTEGER + 1,
  ])('non-finite/non-integer/unsafe cube s %s는 RangeError다', (s) => {
    expect(() => hexCubeToAxial({ q: 0, r: 0, s })).toThrow(RangeError);
  });
});

const OFFSET_LAYOUTS: readonly HexOffsetLayout[] = ['odd-r', 'even-r', 'odd-q', 'even-q'];

describe('hexAxialToOffset / hexOffsetToAxial - axial과 offset 변환', () => {
  test.each(OFFSET_LAYOUTS)('%s layout에서 axial → offset → axial round-trip이 보존된다', (layout) => {
    for (const q of [-3, -2, -1, 0, 1, 2, 3]) {
      for (const r of [-3, -2, -1, 0, 1, 2, 3]) {
        const offset = hexAxialToOffset({ q, r }, layout);
        expect(hexOffsetToAxial(offset, layout)).toEqual({ q, r });
      }
    }
  });

  test('odd-r/even-r 산식을 고정한다', () => {
    expect(hexAxialToOffset({ q: 2, r: 3 }, 'odd-r')).toEqual({ col: 3, row: 3 });
    expect(hexAxialToOffset({ q: 2, r: 3 }, 'even-r')).toEqual({ col: 4, row: 3 });
  });

  test('odd-q/even-q 산식을 고정한다', () => {
    expect(hexAxialToOffset({ q: 3, r: 2 }, 'odd-q')).toEqual({ col: 3, row: 3 });
    expect(hexAxialToOffset({ q: 3, r: 2 }, 'even-q')).toEqual({ col: 3, row: 4 });
  });

  test('negative parity case를 고정한다', () => {
    expect(hexAxialToOffset({ q: -2, r: -3 }, 'odd-r')).toEqual({ col: -4, row: -3 });
    expect(hexAxialToOffset({ q: -2, r: -3 }, 'even-r')).toEqual({ col: -3, row: -3 });
  });

  test('tuple input을 object input과 동일하게 처리한다', () => {
    expect(hexAxialToOffset([2, 3], 'odd-r')).toEqual({ col: 3, row: 3 });
    expect(hexOffsetToAxial([3, 3], 'odd-r')).toEqual({ q: 2, r: 3 });
  });

  test('invalid layout string은 RangeError다', () => {
    expect(() => hexAxialToOffset({ q: 0, r: 0 }, 'odd' as HexOffsetLayout)).toThrow(RangeError);
    expect(() => hexOffsetToAxial({ col: 0, row: 0 }, 'diagonal' as HexOffsetLayout)).toThrow(RangeError);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    1.5,
    Number.MAX_SAFE_INTEGER + 1,
  ])('non-finite/non-integer/unsafe axial q %s는 RangeError다', (q) => {
    expect(() => hexAxialToOffset({ q, r: 0 }, 'odd-r')).toThrow(RangeError);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    1.5,
    Number.MAX_SAFE_INTEGER + 1,
  ])('non-finite/non-integer/unsafe offset row %s는 RangeError다', (row) => {
    expect(() => hexOffsetToAxial({ col: 0, row }, 'odd-r')).toThrow(RangeError);
  });

  test('safe integer 입력이라도 계산된 col/row가 unsafe integer면 RangeError다', () => {
    expect(() => hexAxialToOffset({ q: Number.MAX_SAFE_INTEGER, r: Number.MAX_SAFE_INTEGER }, 'even-r')).toThrow(
      RangeError
    );
    expect(() => hexOffsetToAxial({ col: Number.MAX_SAFE_INTEGER, row: -Number.MAX_SAFE_INTEGER }, 'odd-q')).toThrow(
      RangeError
    );
  });
});
