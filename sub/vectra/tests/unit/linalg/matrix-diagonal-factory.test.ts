/**
 * linalg diagonal/tridiagonal matrix factory unit test.
 */

import { describe, expect, test } from 'vitest';
import { diagonalMatrix } from '../../../src/linalg/diagonal-matrix';
import { diagonalMatrixInto } from '../../../src/linalg/diagonal-matrix-into';
import { tridiagonal } from '../../../src/linalg/tridiagonal';
import { tridiagonalInto } from '../../../src/linalg/tridiagonal-into';

// ---------------------------------------------------------------------------
// diagonalMatrixInto / diagonalMatrix
// ---------------------------------------------------------------------------

describe('diagonalMatrixInto — diagonal entries로 square matrix 생성 (Into)', () => {
  test('size 3 diagonal matrix를 기록한다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
      [9, 9, 9],
    ];
    diagonalMatrixInto(out, [4, 5, 6]);
    expect(out).toEqual([
      [4, 0, 0],
      [0, 5, 0],
      [0, 0, 6],
    ]);
  });

  test('size 1은 [[v]]', () => {
    const out: number[][] = [[9]];
    diagonalMatrixInto(out, [7]);
    expect(out).toEqual([[7]]);
  });

  test('empty diagonalEntries는 out.length = 0만 설정한다', () => {
    const out: number[][] = [[9]];
    diagonalMatrixInto(out, []);
    expect(out).toEqual([]);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'non-finite diagonalEntries entry %s는 RangeError를 던지고 out을 수정하지 않는다',
    (bad) => {
      const out: number[][] = [
        [9, 9],
        [9, 9],
      ];
      expect(() => diagonalMatrixInto(out, [1, bad])).toThrow(RangeError);
      expect(out).toEqual([
        [9, 9],
        [9, 9],
      ]);
    }
  );

  test('out capacity 부족 시 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9, 9]];
    expect(() => diagonalMatrixInto(out, [1, 2])).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });
});

describe('diagonalMatrix — diagonal entries로 square matrix 생성 (companion)', () => {
  test('새 number[][] 배열을 반환한다', () => {
    expect(diagonalMatrix([1, 2, 3])).toEqual([
      [1, 0, 0],
      [0, 2, 0],
      [0, 0, 3],
    ]);
  });

  test('empty는 빈 배열', () => {
    expect(diagonalMatrix([])).toEqual([]);
  });

  test('non-finite entry는 RangeError', () => {
    expect(() => diagonalMatrix([1, Number.NaN])).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// tridiagonalInto / tridiagonal
// ---------------------------------------------------------------------------

describe('tridiagonalInto — tridiagonal square matrix 생성 (Into)', () => {
  test('size 4 tridiagonal matrix를 layout 그대로 기록한다', () => {
    const out: number[][] = [
      [9, 9, 9, 9],
      [9, 9, 9, 9],
      [9, 9, 9, 9],
      [9, 9, 9, 9],
    ];
    tridiagonalInto(out, [1, 2, 3, 4], [5, 6, 7], [8, 9, 10]);
    expect(out).toEqual([
      [1, 8, 0, 0],
      [5, 2, 9, 0],
      [0, 6, 3, 10],
      [0, 0, 7, 4],
    ]);
  });

  test('size 1은 [[v]] (left/right empty)', () => {
    const out: number[][] = [[9]];
    tridiagonalInto(out, [5], [], []);
    expect(out).toEqual([[5]]);
  });

  test('empty diagonalEntries는 out.length = 0만 설정한다', () => {
    const out: number[][] = [[9]];
    tridiagonalInto(out, [], [], []);
    expect(out).toEqual([]);
  });

  test('leftEntries.length가 n - 1이 아니면 RangeError', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() => tridiagonalInto(out, [1, 2], [], [3])).toThrow(RangeError);
    expect(() => tridiagonalInto(out, [1, 2], [3, 4], [5])).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('rightEntries.length가 n - 1이 아니면 RangeError', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() => tridiagonalInto(out, [1, 2], [3], [])).toThrow(RangeError);
    expect(() => tridiagonalInto(out, [1, 2], [3], [4, 5])).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('size 1에서 left/right가 비어있지 않으면 RangeError', () => {
    const out: number[][] = [[9]];
    expect(() => tridiagonalInto(out, [1], [2], [])).toThrow(RangeError);
    expect(() => tridiagonalInto(out, [1], [], [2])).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test.each([
    ['diagonalEntries', [Number.NaN], [], []] as const,
    ['leftEntries', [1, 2], [Number.POSITIVE_INFINITY], [3]] as const,
    ['rightEntries', [1, 2], [3], [Number.NEGATIVE_INFINITY]] as const,
  ])('non-finite %s는 RangeError를 던지고 out을 수정하지 않는다', (_, diag, left, right) => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() => tridiagonalInto(out, diag, left, right)).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('out capacity 부족 시 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9, 9]];
    expect(() => tridiagonalInto(out, [1, 2, 3], [4, 5], [6, 7])).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });
});

describe('tridiagonal — tridiagonal square matrix 생성 (companion)', () => {
  test('새 number[][] 배열을 반환한다', () => {
    expect(tridiagonal([1, 2, 3], [4, 5], [6, 7])).toEqual([
      [1, 6, 0],
      [4, 2, 7],
      [0, 5, 3],
    ]);
  });

  test('empty는 빈 배열', () => {
    expect(tridiagonal([], [], [])).toEqual([]);
  });

  test('length mismatch는 RangeError', () => {
    expect(() => tridiagonal([1, 2], [3, 4], [5])).toThrow(RangeError);
  });
});
