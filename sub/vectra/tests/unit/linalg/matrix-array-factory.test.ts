/**
 * linalg array/callback matrix factory unit test.
 */

import { describe, expect, test, vi } from 'vitest';
import { fromColumns } from '../../../src/linalg/from-columns';
import { fromIndexFunction } from '../../../src/linalg/from-index-function';
import { fromIndexFunctionInto } from '../../../src/linalg/from-index-function-into';
import { fromRows } from '../../../src/linalg/from-rows';

// ---------------------------------------------------------------------------
// fromRows
// ---------------------------------------------------------------------------

describe('fromRows — matrix deep copy', () => {
  test('rectangular matrix를 deep copy해 새 nested array를 반환한다', () => {
    const src: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const out = fromRows(src);
    expect(out).toEqual([
      [1, 2],
      [3, 4],
    ]);
    expect(out).not.toBe(src);
    expect(out[0]).not.toBe(src[0]);
    expect(out[1]).not.toBe(src[1]);
  });

  test('input row 변경이 결과에 영향을 주지 않는다', () => {
    const src: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const out = fromRows(src);
    src[0][0] = 99;
    expect(out[0][0]).toBe(1);
  });

  test('빈 matrix `[]`는 빈 배열을 반환한다', () => {
    expect(fromRows([])).toEqual([]);
  });

  test('ragged matrix는 RangeError', () => {
    expect(() =>
      fromRows([
        [1, 2],
        [3, 4, 5],
      ])
    ).toThrow(RangeError);
  });

  test('one-sided zero shape `[[]]`은 RangeError', () => {
    expect(() => fromRows([[]])).toThrow(RangeError);
  });

  test('non-finite entry는 RangeError', () => {
    expect(() => fromRows([[1, Number.NaN]])).toThrow(RangeError);
    expect(() => fromRows([[Number.POSITIVE_INFINITY]])).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// fromColumns
// ---------------------------------------------------------------------------

describe('fromColumns — column 목록을 matrix로 변환', () => {
  test('2 columns 길이 3은 3x2 matrix를 반환한다', () => {
    expect(
      fromColumns([
        [1, 2, 3],
        [4, 5, 6],
      ])
    ).toEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ]);
  });

  test('단일 column 길이 N은 Nx1 matrix를 반환한다', () => {
    expect(fromColumns([[1, 2, 3]])).toEqual([[1], [2], [3]]);
  });

  test('빈 columns 입력은 빈 배열을 반환한다', () => {
    expect(fromColumns([])).toEqual([]);
  });

  test('column 길이가 다르면 RangeError', () => {
    expect(() => fromColumns([[1, 2], [3]])).toThrow(RangeError);
  });

  test('빈 column이지만 column 수가 ≥ 1이면 one-sided zero shape이라 RangeError', () => {
    expect(() => fromColumns([[]])).toThrow(RangeError);
    expect(() => fromColumns([[], []])).toThrow(RangeError);
  });

  test('non-finite entry는 RangeError', () => {
    expect(() =>
      fromColumns([
        [1, Number.NaN],
        [3, 4],
      ])
    ).toThrow(RangeError);
    expect(() => fromColumns([[Number.POSITIVE_INFINITY]])).toThrow(RangeError);
  });

  test('input column 변경이 결과에 영향을 주지 않는다', () => {
    const cols: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const out = fromColumns(cols);
    cols[0][0] = 99;
    expect(out[0][0]).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// fromIndexFunctionInto / fromIndexFunction
// ---------------------------------------------------------------------------

describe('fromIndexFunctionInto — callback 기반 matrix 생성 (Into)', () => {
  test('callback에 (row, column)을 전달하고 결과를 기록한다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
    ];
    fromIndexFunctionInto(out, [2, 3], (r, c) => r * 10 + c);
    expect(out).toEqual([
      [0, 1, 2],
      [10, 11, 12],
    ]);
  });

  test('out row 또는 row capacity가 더 크면 target shape로 truncate한다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
      [9, 9, 9],
    ];
    fromIndexFunctionInto(out, [2, 2], () => 1);
    expect(out).toEqual([
      [1, 1],
      [1, 1],
    ]);
  });

  test('[0, 0] shape는 callback을 호출하지 않고 out.length = 0만 설정한다', () => {
    const out: number[][] = [[9]];
    const fn = vi.fn(() => 1);
    fromIndexFunctionInto(out, [0, 0], fn);
    expect(out).toEqual([]);
    expect(fn).not.toHaveBeenCalled();
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'callback이 non-finite %s를 반환하면 RangeError를 던지고 out을 수정하지 않는다',
    (badValue) => {
      const out: number[][] = [
        [9, 9],
        [9, 9],
      ];
      expect(() => fromIndexFunctionInto(out, [2, 2], () => badValue)).toThrow(RangeError);
      expect(out).toEqual([
        [9, 9],
        [9, 9],
      ]);
    }
  );

  test('callback이 throw하면 그대로 전파하고 out을 수정하지 않는다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() =>
      fromIndexFunctionInto(out, [2, 2], () => {
        throw new Error('callback failure');
      })
    ).toThrow('callback failure');
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('one-sided zero shape는 RangeError', () => {
    const out: number[][] = [];
    expect(() => fromIndexFunctionInto(out, [2, 0], () => 0)).toThrow(RangeError);
    expect(() => fromIndexFunctionInto(out, [0, 2], () => 0)).toThrow(RangeError);
  });

  test('out capacity 부족 시 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() => fromIndexFunctionInto(out, [2, 2], () => 1)).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });
});

describe('fromIndexFunction — callback 기반 matrix 생성 (companion)', () => {
  test('새 number[][] 배열을 반환한다', () => {
    expect(fromIndexFunction([3, 3], (r, c) => (r === c ? 1 : 0))).toEqual([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
  });

  test('[0, 0] shape는 callback을 호출하지 않고 빈 배열을 반환한다', () => {
    const fn = vi.fn(() => 1);
    expect(fromIndexFunction([0, 0], fn)).toEqual([]);
    expect(fn).not.toHaveBeenCalled();
  });

  test('non-finite 결과는 RangeError', () => {
    expect(() => fromIndexFunction([1, 1], () => Number.NaN)).toThrow(RangeError);
  });

  test('callback throw는 그대로 전파한다', () => {
    expect(() =>
      fromIndexFunction([2, 2], () => {
        throw new Error('boom');
      })
    ).toThrow('boom');
  });
});
