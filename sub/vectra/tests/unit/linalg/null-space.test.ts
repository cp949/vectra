/**
 * nullSpaceInto / nullSpace 단위 테스트.
 *
 * nullSpaceInto 정상 입력: full-rank `[]`, rank-deficient RREF canonical basis,
 *   zero matrix standard basis, empty matrix `[]`, A*x = 0 만족, -0 canonicalize.
 * nullSpaceInto 예외: ragged/empty-row/non-finite/invalid options RangeError,
 *   output capacity 부족 RangeError, options 검증이 matrix보다 먼저.
 * nullSpace companion: fresh storage, 전 경우 smoke.
 */

import { describe, expect, test } from 'vitest';
import { nullSpace } from '../../../src/linalg/null-space';
import { nullSpaceInto } from '../../../src/linalg/null-space-into';

/**
 * `A * v = 0` 만족 여부를 element-wise 거리로 검증한다.
 * basis 벡터가 실제로 nullspace에 속하는지 수치적으로 확인할 때 사용한다.
 */
function expectAnnihilates(
  matrix: readonly (readonly number[])[],
  basis: readonly (readonly number[])[],
  tolerance = 1e-9
): void {
  for (const vector of basis) {
    for (const row of matrix) {
      let sum = 0;
      for (let c = 0; c < row.length; c++) {
        sum += row[c] * vector[c];
      }
      expect(Math.abs(sum)).toBeLessThanOrEqual(tolerance);
    }
  }
}

describe('nullSpaceInto — 정상 입력', () => {
  test('full column rank square matrix는 빈 basis', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    const result = nullSpaceInto(out, [
      [1, 0],
      [0, 1],
    ]);
    expect(result).toBe(out);
    expect(out).toEqual([]);
  });

  test('rank-deficient 2x3 [[1, 2, 3], [2, 4, 6]]은 dimension 2 canonical basis', () => {
    const A = [
      [1, 2, 3],
      [2, 4, 6],
    ];
    const out: number[][] = [new Array(3).fill(9), new Array(3).fill(9), new Array(3).fill(9)];
    nullSpaceInto(out, A);
    // RREF = [[1, 2, 3], [0, 0, 0]] → pivot col 0, free col 1 & 2.
    // basis vector free col 1: [-2, 1, 0], free col 2: [-3, 0, 1].
    expect(out).toEqual([
      [-2, 1, 0],
      [-3, 0, 1],
    ]);
    expectAnnihilates(A, out);
  });

  test('zero 2x3 matrix는 column 수만큼 standard basis row vector', () => {
    const A = [
      [0, 0, 0],
      [0, 0, 0],
    ];
    const out: number[][] = [new Array(3).fill(9), new Array(3).fill(9), new Array(3).fill(9)];
    nullSpaceInto(out, A);
    expect(out).toEqual([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
  });

  test('empty matrix `[]`는 out.length = 0', () => {
    const out: number[][] = [[9], [9]];
    nullSpaceInto(out, []);
    expect(out).toEqual([]);
  });

  test('rank-deficient single row [1, 2, 3]은 dimension 2 basis', () => {
    const A = [[1, 2, 3]];
    const out: number[][] = [new Array(3).fill(0), new Array(3).fill(0), new Array(3).fill(0)];
    nullSpaceInto(out, A);
    expect(out).toEqual([
      [-2, 1, 0],
      [-3, 0, 1],
    ]);
    expectAnnihilates(A, out);
  });

  test('결과 entry의 -0은 +0으로 canonicalize', () => {
    // RREF가 정확히 0 entry를 만들도록 한다.
    const out: number[][] = [new Array(2).fill(9), new Array(2).fill(9)];
    nullSpaceInto(out, [[1, 0]]);
    expect(out).toEqual([[0, 1]]);
    for (const row of out) {
      for (const v of row) {
        expect(Object.is(v, -0)).toBe(false);
      }
    }
  });
});

describe('nullSpaceInto — invalid input', () => {
  test('ragged matrix는 RangeError', () => {
    const out: number[][] = [];
    expect(() => nullSpaceInto(out, [[1, 2], [3]] as unknown as number[][])).toThrow(RangeError);
  });

  test('[[]]은 one-sided zero shape RangeError', () => {
    const out: number[][] = [];
    expect(() => nullSpaceInto(out, [[]])).toThrow(RangeError);
  });

  test('non-finite entry는 RangeError', () => {
    const out: number[][] = [];
    expect(() => nullSpaceInto(out, [[1, Number.NaN]])).toThrow(RangeError);
    expect(() => nullSpaceInto(out, [[Number.POSITIVE_INFINITY, 0]])).toThrow(RangeError);
    expect(() => nullSpaceInto(out, [[Number.NEGATIVE_INFINITY, 0]])).toThrow(RangeError);
  });

  test('invalid options(maxIterations=0, tolerance=-1, epsilon=-1)는 RangeError', () => {
    const out: number[][] = [];
    expect(() => nullSpaceInto(out, [[1]], { maxIterations: 0 })).toThrow(RangeError);
    expect(() => nullSpaceInto(out, [[1]], { tolerance: -1 })).toThrow(RangeError);
    expect(() => nullSpaceInto(out, [[1]], { epsilon: -1 })).toThrow(RangeError);
  });

  test('out row 부족이면 RangeError이고 out은 미수정', () => {
    const out: number[][] = [[9, 9, 9]];
    expect(() => nullSpaceInto(out, [[0, 0, 0]])).toThrow(RangeError);
    expect(out).toEqual([[9, 9, 9]]);
  });

  test('out row capacity 부족이면 RangeError이고 out은 미수정', () => {
    const out: number[][] = [[9, 9]];
    expect(() => nullSpaceInto(out, [[1, 2, 3]])).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('options 검증 실패 시 out 미수정 (matrix 검증보다 먼저)', () => {
    const out: number[][] = [[9], [9]];
    expect(() => nullSpaceInto(out, [[1, Number.NaN]], { epsilon: -1 })).toThrow(/epsilon/);
    expect(out).toEqual([[9], [9]]);
  });
});

describe('nullSpace — companion', () => {
  test('rank-deficient 2x3은 fresh storage canonical basis', () => {
    const result = nullSpace([
      [1, 2, 3],
      [2, 4, 6],
    ]);
    expect(result).toEqual([
      [-2, 1, 0],
      [-3, 0, 1],
    ]);
  });

  test('full column rank는 []', () => {
    expect(
      nullSpace([
        [1, 0],
        [0, 1],
      ])
    ).toEqual([]);
  });

  test('empty matrix는 []', () => {
    expect(nullSpace([])).toEqual([]);
  });

  test('zero matrix는 standard basis', () => {
    expect(
      nullSpace([
        [0, 0],
        [0, 0],
      ])
    ).toEqual([
      [1, 0],
      [0, 1],
    ]);
  });

  test('invalid matrix는 RangeError', () => {
    expect(() => nullSpace([[1, Number.POSITIVE_INFINITY]])).toThrow(RangeError);
  });

  test('큰 epsilon은 작은 entry를 zero로 본다', () => {
    const A = [[1, 1e-6, 1]];
    // default epsilon(1e-9)에서는 모든 entry가 pivot 후보.
    // epsilon=1e-3이면 [0][1] entry는 zero column으로 보고 free column으로 분류된다.
    const basis = nullSpace(A, { epsilon: 1e-3 });
    // RREF 결과 자체는 큰 epsilon에서 [[1, 0, 1]]로 cleanup된다(2번째 entry가 cleanup).
    // 그러면 pivot col 0, free col 1, 2 → basis [[ 0, 1, 0], [-1, 0, 1]].
    expect(basis).toEqual([
      [0, 1, 0],
      [-1, 0, 1],
    ]);
  });
});
