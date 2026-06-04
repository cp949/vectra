/**
 * columnSpaceInto / columnSpace 단위 테스트.
 *
 * columnSpaceInto 정상 입력: identity/full-rank, tall rank-deficient, zero matrix,
 *   empty matrix, square full-rank, repeated singular value — orthonormality/span.
 * columnSpaceInto 예외: ragged/empty-row/non-finite/invalid options RangeError,
 *   SVD convergence cap → undefined, output capacity 부족 RangeError.
 * columnSpace companion: fresh storage, -0 canonicalize.
 */

import { describe, expect, test } from 'vitest';
import { columnSpace } from '../../../src/linalg/column-space';
import { columnSpaceInto } from '../../../src/linalg/column-space-into';

/**
 * basis row 사이 dot product가 identity와 일치하는지 검증한다.
 * column space basis가 orthonormal 조건을 만족하는지 확인할 때 사용한다.
 */
function expectOrthonormalRows(basis: readonly (readonly number[])[], precision = 8): void {
  for (let i = 0; i < basis.length; i++) {
    for (let j = i; j < basis.length; j++) {
      let dot = 0;
      for (let c = 0; c < basis[i].length; c++) {
        dot += basis[i][c] * basis[j][c];
      }
      expect(dot).toBeCloseTo(i === j ? 1 : 0, precision);
    }
  }
}

/**
 * `matrix`의 column이 `basis` row가 span하는 부분공간에 들어가는지 검증한다.
 * basis가 orthonormal이면 column `c`에 대해 `c == sum_k <c, b_k> * b_k`를 만족해야 한다.
 */
function expectColumnsInSpan(
  matrix: readonly (readonly number[])[],
  basis: readonly (readonly number[])[],
  precision = 7
): void {
  const m = matrix.length;
  if (m === 0) return;
  const n = matrix[0].length;
  for (let col = 0; col < n; col++) {
    const columnVector: number[] = new Array(m);
    for (let r = 0; r < m; r++) {
      columnVector[r] = matrix[r][col];
    }
    const projected: number[] = new Array(m).fill(0);
    for (const b of basis) {
      let coeff = 0;
      for (let r = 0; r < m; r++) {
        coeff += columnVector[r] * b[r];
      }
      for (let r = 0; r < m; r++) {
        projected[r] += coeff * b[r];
      }
    }
    for (let r = 0; r < m; r++) {
      expect(projected[r]).toBeCloseTo(columnVector[r], precision);
    }
  }
}

describe('columnSpaceInto — 정상 입력', () => {
  test('2x2 identity는 2개 orthonormal row vector basis', () => {
    const A = [
      [1, 0],
      [0, 1],
    ];
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    const result = columnSpaceInto(out, A);
    expect(result).toBe(out);
    expect(out.length).toBe(2);
    expectOrthonormalRows(out);
    expectColumnsInSpan(A, out);
  });

  test('tall rank-deficient 3x2 [[1,2],[2,4],[3,6]]는 rank 1 unit basis', () => {
    const A = [
      [1, 2],
      [2, 4],
      [3, 6],
    ];
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
    ];
    columnSpaceInto(out, A);
    expect(out.length).toBe(1);
    expect(out[0].length).toBe(3);
    expectOrthonormalRows(out);
    expectColumnsInSpan(A, out);
  });

  test('zero 2x3 matrix는 rank 0이라 out.length = 0', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    columnSpaceInto(out, [
      [0, 0, 0],
      [0, 0, 0],
    ]);
    expect(out).toEqual([]);
  });

  test('empty matrix `[]`는 rank 0이라 out.length = 0', () => {
    const out: number[][] = [[9]];
    columnSpaceInto(out, []);
    expect(out).toEqual([]);
  });

  test('square full-rank 3x3 reconstruction은 identity-equivalent column space', () => {
    const A = [
      [4, 0, 0],
      [0, 3, 0],
      [0, 0, 2],
    ];
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
      [9, 9, 9],
    ];
    columnSpaceInto(out, A);
    expect(out.length).toBe(3);
    expectOrthonormalRows(out);
    expectColumnsInSpan(A, out);
  });

  test('repeated singular value (multiplicity > 1)에서 span/orthonormality 유지', () => {
    // diag(2, 2, 1)은 sigma = [2, 2, 1]. multiplicity 2 eigenspace의 basis 회전은 Jacobi 결과에
    // 의존하지만 span/orthonormality/reconstruction 성질은 회전과 독립이어야 한다.
    const A = [
      [2, 0, 0],
      [0, 2, 0],
      [0, 0, 1],
    ];
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
      [9, 9, 9],
    ];
    columnSpaceInto(out, A);
    expect(out.length).toBe(3);
    expectOrthonormalRows(out);
    expectColumnsInSpan(A, out);
  });
});

describe('columnSpaceInto — invalid input', () => {
  test('ragged matrix는 RangeError', () => {
    const out: number[][] = [];
    expect(() => columnSpaceInto(out, [[1, 2], [3]] as unknown as number[][])).toThrow(RangeError);
  });

  test('[[]]은 one-sided zero shape RangeError', () => {
    const out: number[][] = [];
    expect(() => columnSpaceInto(out, [[]])).toThrow(RangeError);
  });

  test('non-finite entry는 RangeError', () => {
    const out: number[][] = [];
    expect(() => columnSpaceInto(out, [[1, Number.NaN]])).toThrow(RangeError);
    expect(() => columnSpaceInto(out, [[Number.POSITIVE_INFINITY, 0]])).toThrow(RangeError);
    expect(() => columnSpaceInto(out, [[Number.NEGATIVE_INFINITY, 0]])).toThrow(RangeError);
  });

  test('invalid options(maxIterations=0)는 RangeError', () => {
    const out: number[][] = [];
    expect(() => columnSpaceInto(out, [[1]], { maxIterations: 0 })).toThrow(RangeError);
  });

  test('convergence cap이 너무 작으면 undefined (SVD가 수렴하지 못함)', () => {
    // 2x2 symmetric에 가까운 nontrivial matrix와 maxIterations=1을 함께 쓰면 Jacobi가 1회 안에
    // 수렴하지 못한다.
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    const result = columnSpaceInto(
      out,
      [
        [1, 0.7],
        [0.7, 1],
      ],
      { maxIterations: 1, tolerance: 1e-20 }
    );
    expect(result).toBeUndefined();
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('out row 부족이면 RangeError이고 out은 미수정', () => {
    const A = [
      [1, 0],
      [0, 1],
    ];
    const out: number[][] = [[9, 9]];
    expect(() => columnSpaceInto(out, A)).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('out row capacity 부족이면 RangeError이고 out은 미수정', () => {
    const A = [
      [1, 0],
      [0, 1],
    ];
    const out: number[][] = [[9], [9]];
    expect(() => columnSpaceInto(out, A)).toThrow(RangeError);
    expect(out).toEqual([[9], [9]]);
  });
});

describe('columnSpace — companion', () => {
  test('tall rank-deficient는 rank 1 orthonormal basis', () => {
    const A = [
      [1, 2],
      [2, 4],
      [3, 6],
    ];
    const result = columnSpace(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result.length).toBe(1);
    expect(result[0].length).toBe(3);
    expectOrthonormalRows(result);
    expectColumnsInSpan(A, result);
  });

  test('zero matrix는 []', () => {
    expect(
      columnSpace([
        [0, 0],
        [0, 0],
      ])
    ).toEqual([]);
  });

  test('empty matrix `[]`는 []', () => {
    expect(columnSpace([])).toEqual([]);
  });

  test('convergence cap으로 SVD가 실패하면 undefined', () => {
    const result = columnSpace(
      [
        [1, 0.7],
        [0.7, 1],
      ],
      { maxIterations: 1, tolerance: 1e-20 }
    );
    expect(result).toBeUndefined();
  });

  test('결과 entry의 -0은 +0으로 canonicalize', () => {
    const A = [
      [1, 0],
      [0, 0],
    ];
    const result = columnSpace(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    for (const row of result) {
      for (const v of row) {
        expect(Object.is(v, -0)).toBe(false);
      }
    }
  });
});
