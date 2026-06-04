/**
 * rankBasisInto / rankBasis 단위 테스트.
 *
 * rankBasisInto 정상 입력: full column rank, rank-deficient pivot column 선택,
 *   zero matrix, empty matrix, epsilon-sensitive pivot, 원본 column 참조 미공유, -0 canonicalize.
 * rankBasisInto 예외: ragged/empty-row/non-finite/invalid options RangeError,
 *   output capacity 부족 RangeError.
 * rankBasis companion: fresh storage, pivot column 선택 smoke.
 */

import { describe, expect, test } from 'vitest';
import { rankBasis } from '../../../src/linalg/rank-basis';
import { rankBasisInto } from '../../../src/linalg/rank-basis-into';

describe('rankBasisInto — 정상 입력', () => {
  test('full column rank 3x2는 원본 두 column을 row vector basis로 반환', () => {
    const A = [
      [1, 0],
      [0, 1],
      [0, 0],
    ];
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
    ];
    const result = rankBasisInto(out, A);
    expect(result).toBe(out);
    // pivot col 0, col 1. basis = column 0/1을 row vector로.
    expect(out).toEqual([
      [1, 0, 0],
      [0, 1, 0],
    ]);
  });

  test('rank-deficient 3x3 [[1,2,1],[2,4,2],[3,6,3]]는 pivot column 1개만 반환', () => {
    const A = [
      [1, 2, 1],
      [2, 4, 2],
      [3, 6, 3],
    ];
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
      [9, 9, 9],
    ];
    rankBasisInto(out, A);
    // partial pivoting RREF는 column 0에서 pivot을 잡고 column 1, 2는 dependent로 분류한다.
    expect(out.length).toBe(1);
    expect(out[0]).toEqual([1, 2, 3]);
  });

  test('zero 2x3 matrix는 rank 0이라 out.length = 0', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    rankBasisInto(out, [
      [0, 0, 0],
      [0, 0, 0],
    ]);
    expect(out).toEqual([]);
  });

  test('empty matrix `[]`는 out.length = 0', () => {
    const out: number[][] = [[9]];
    rankBasisInto(out, []);
    expect(out).toEqual([]);
  });

  test('큰 epsilon은 작은 pivot column을 rank basis에서 제외한다', () => {
    const A = [
      [1, 1e-6],
      [0, 1e-6],
    ];
    const out1: number[][] = [
      [9, 9],
      [9, 9],
    ];
    rankBasisInto(out1, A, { epsilon: 1e-9 });
    expect(out1.length).toBe(2);

    const out2: number[][] = [
      [9, 9],
      [9, 9],
    ];
    rankBasisInto(out2, A, { epsilon: 1e-3 });
    // epsilon=1e-3에서는 작은 column이 zero column으로 분류되어 pivot이 column 0만 남는다.
    expect(out2.length).toBe(1);
    expect(out2[0]).toEqual([1, 0]);
  });

  test('basis vector는 input column 참조를 공유하지 않는다', () => {
    const A: number[][] = [
      [1, 0],
      [0, 1],
    ];
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    rankBasisInto(out, A);
    // out row를 수정해도 A는 변하지 않아야 한다.
    out[0][0] = 999;
    expect(A[0][0]).toBe(1);
  });

  test('basis entry에 -0이 있으면 +0으로 canonicalize', () => {
    const A = [
      [1, 2],
      [-0, 3],
    ];
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    rankBasisInto(out, A);
    expect(out.length).toBe(2);
    for (const row of out) {
      for (const v of row) {
        expect(Object.is(v, -0)).toBe(false);
      }
    }
  });
});

describe('rankBasisInto — invalid input', () => {
  test('ragged matrix는 RangeError', () => {
    const out: number[][] = [];
    expect(() => rankBasisInto(out, [[1, 2], [3]] as unknown as number[][])).toThrow(RangeError);
  });

  test('[[]]은 one-sided zero shape RangeError', () => {
    const out: number[][] = [];
    expect(() => rankBasisInto(out, [[]])).toThrow(RangeError);
  });

  test('non-finite entry는 RangeError', () => {
    const out: number[][] = [];
    expect(() => rankBasisInto(out, [[1, Number.NaN]])).toThrow(RangeError);
    expect(() => rankBasisInto(out, [[Number.POSITIVE_INFINITY, 0]])).toThrow(RangeError);
    expect(() => rankBasisInto(out, [[Number.NEGATIVE_INFINITY, 0]])).toThrow(RangeError);
  });

  test('invalid options(maxIterations=0, tolerance=-1, epsilon=NaN)는 RangeError', () => {
    const out: number[][] = [];
    expect(() => rankBasisInto(out, [[1]], { maxIterations: 0 })).toThrow(RangeError);
    expect(() => rankBasisInto(out, [[1]], { tolerance: -1 })).toThrow(RangeError);
    expect(() => rankBasisInto(out, [[1]], { epsilon: Number.NaN })).toThrow(RangeError);
  });

  test('out row 부족이면 RangeError이고 out은 미수정', () => {
    const A = [
      [1, 0],
      [0, 1],
    ];
    const out: number[][] = [[9, 9]];
    expect(() => rankBasisInto(out, A)).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('out row capacity 부족이면 RangeError이고 out은 미수정', () => {
    const A = [
      [1, 0],
      [0, 1],
    ];
    const out: number[][] = [[9], [9]];
    expect(() => rankBasisInto(out, A)).toThrow(RangeError);
    expect(out).toEqual([[9], [9]]);
  });
});

describe('rankBasis — companion', () => {
  test('full column rank는 fresh storage 원본 column basis', () => {
    const result = rankBasis([
      [1, 0],
      [0, 1],
      [0, 0],
    ]);
    expect(result).toEqual([
      [1, 0, 0],
      [0, 1, 0],
    ]);
  });

  test('zero matrix는 []', () => {
    expect(
      rankBasis([
        [0, 0],
        [0, 0],
      ])
    ).toEqual([]);
  });

  test('empty matrix는 []', () => {
    expect(rankBasis([])).toEqual([]);
  });

  test('rank-deficient는 pivot column만 반환', () => {
    const result = rankBasis([
      [1, 2, 4],
      [2, 4, 8],
    ]);
    expect(result.length).toBe(1);
    expect(result[0]).toEqual([1, 2]);
  });
});
