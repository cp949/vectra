/**
 * linalg SVD unit test.
 *
 * singularValueDecomposition
 *   — 정상 입력: square diagonal, tall (m > n), wide (m < n), reference 2x3 matrix reconstruction.
 *   — rank-deficient (rank < min(m, n)) / zero matrix / empty matrix.
 *   — singular values descending, U^T U = I_r, V^T V = I_r.
 *   — validation: ragged, [[]], non-finite, invalid options.
 *   — convergence cap → undefined.
 *   — result -0 미보존.
 */

import { describe, expect, test } from 'vitest';
import { multiplyMatrices } from '../../../src/linalg/multiply-matrices';
import { singularValueDecomposition } from '../../../src/linalg/singular-value-decomposition';
import { transpose } from '../../../src/linalg/transpose';

/**
 * 두 matrix가 element-wise로 가까운지 검증한다. shape도 함께 확인한다.
 */
function expectMatrixCloseTo(
  actual: readonly (readonly number[])[],
  expected: readonly (readonly number[])[],
  precision = 8
): void {
  expect(actual.length).toBe(expected.length);
  for (let r = 0; r < expected.length; r++) {
    expect(actual[r].length).toBe(expected[r].length);
    for (let c = 0; c < expected[r].length; c++) {
      expect(actual[r][c]).toBeCloseTo(expected[r][c], precision);
    }
  }
}

/** k x k identity. */
function identity(k: number): number[][] {
  const out: number[][] = [];
  for (let i = 0; i < k; i++) {
    const row: number[] = [];
    for (let j = 0; j < k; j++) row.push(i === j ? 1 : 0);
    out.push(row);
  }
  return out;
}

/**
 * thin SVD shape를 검증한다.
 */
function expectSvdShape(
  result: {
    readonly leftSingularVectors: number[][];
    readonly singularValues: number[];
    readonly rightSingularVectors: number[][];
    readonly rank: number;
  },
  m: number,
  n: number,
  rank: number
): void {
  expect(result.rank).toBe(rank);
  if (rank === 0) {
    expect(result.leftSingularVectors).toEqual([]);
    expect(result.singularValues).toEqual([]);
    expect(result.rightSingularVectors).toEqual([]);
    return;
  }
  expect(result.singularValues.length).toBe(rank);
  expect(result.leftSingularVectors.length).toBe(m);
  for (const row of result.leftSingularVectors) {
    expect(row.length).toBe(rank);
  }
  expect(result.rightSingularVectors.length).toBe(n);
  for (const row of result.rightSingularVectors) {
    expect(row.length).toBe(rank);
  }
}

/**
 * `U * diag(sigma) * V^T`가 `A`와 가까운지 검증한다.
 */
function expectReconstruction(
  A: readonly (readonly number[])[],
  result: {
    readonly leftSingularVectors: number[][];
    readonly singularValues: number[];
    readonly rightSingularVectors: number[][];
    readonly rank: number;
  },
  precision = 8
): void {
  const sigmaMatrix: number[][] = new Array(result.rank);
  for (let i = 0; i < result.rank; i++) {
    const row = new Array<number>(result.rank);
    for (let j = 0; j < result.rank; j++) {
      row[j] = i === j ? result.singularValues[i] : 0;
    }
    sigmaMatrix[i] = row;
  }
  const usigma = multiplyMatrices(result.leftSingularVectors, sigmaMatrix);
  const reconstructed = multiplyMatrices(usigma, transpose(result.rightSingularVectors));
  expectMatrixCloseTo(reconstructed, A, precision);
}

describe('singularValueDecomposition — 정상 입력 full-rank', () => {
  test('reference 2x3 matrix [[3,2,2],[2,3,-2]]를 reconstruction한다', () => {
    const A = [
      [3, 2, 2],
      [2, 3, -2],
    ];
    const result = singularValueDecomposition(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectSvdShape(result, 2, 3, 2);
    // singular values = sqrt(25), sqrt(9) = 5, 3.
    expect(result.singularValues[0]).toBeCloseTo(5, 8);
    expect(result.singularValues[1]).toBeCloseTo(3, 8);
    expectReconstruction(A, result);
  });

  test('square diagonal matrix는 |diagonal|을 singular value로 반환한다', () => {
    const A = [
      [3, 0],
      [0, -5],
    ];
    const result = singularValueDecomposition(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectSvdShape(result, 2, 2, 2);
    expect(result.singularValues[0]).toBeCloseTo(5, 10);
    expect(result.singularValues[1]).toBeCloseTo(3, 10);
    expectReconstruction(A, result, 10);
  });

  test('tall matrix(m > n)도 thin SVD를 만족한다', () => {
    const A = [
      [1, 0],
      [0, 1],
      [1, 1],
    ];
    const result = singularValueDecomposition(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectSvdShape(result, 3, 2, 2);
    expectReconstruction(A, result);
    // U^T U = I_2, V^T V = I_2.
    expectMatrixCloseTo(
      multiplyMatrices(transpose(result.leftSingularVectors), result.leftSingularVectors),
      identity(2)
    );
    expectMatrixCloseTo(
      multiplyMatrices(transpose(result.rightSingularVectors), result.rightSingularVectors),
      identity(2)
    );
  });

  test('wide matrix(m < n)도 thin SVD를 만족한다', () => {
    const A = [
      [1, 2, 0],
      [0, 1, 1],
    ];
    const result = singularValueDecomposition(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectSvdShape(result, 2, 3, 2);
    expectReconstruction(A, result);
    expectMatrixCloseTo(
      multiplyMatrices(transpose(result.leftSingularVectors), result.leftSingularVectors),
      identity(2)
    );
    expectMatrixCloseTo(
      multiplyMatrices(transpose(result.rightSingularVectors), result.rightSingularVectors),
      identity(2)
    );
  });
});

describe('singularValueDecomposition — rank deficient / zero / empty', () => {
  test('rank-deficient matrix는 rank < min(m,n) thin SVD를 반환한다', () => {
    // row 2 = row 1 * 2. rank 1.
    const A = [
      [1, 2, 3],
      [2, 4, 6],
    ];
    const result = singularValueDecomposition(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectSvdShape(result, 2, 3, 1);
    expect(result.singularValues[0]).toBeCloseTo(Math.sqrt(70), 8);
    // 70 = (1+4+9) * (1 + 4) = 14 * 5. ||A||_F^2 = 1+4+9+4+16+36 = 70.
    expectReconstruction(A, result);
  });

  test('zero matrix는 rank=0 thin SVD를 반환한다', () => {
    const A = [
      [0, 0],
      [0, 0],
    ];
    const result = singularValueDecomposition(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectSvdShape(result, 2, 2, 0);
  });

  test('빈 matrix []는 rank=0 빈 SVD를 반환한다', () => {
    const result = singularValueDecomposition([]);
    expect(result).toEqual({
      leftSingularVectors: [],
      singularValues: [],
      rightSingularVectors: [],
      rank: 0,
    });
  });

  test('singular value는 descending 정렬된다', () => {
    const A = [
      [4, 0],
      [0, 1],
    ];
    const result = singularValueDecomposition(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result.singularValues[0]).toBeGreaterThan(result.singularValues[1]);
  });

  test('3개 이상 singular value도 strict monotonic descending이다', () => {
    // diag(5, 3, 2). singular values = |5|, |3|, |2| = 5, 3, 2.
    const A = [
      [5, 0, 0],
      [0, 3, 0],
      [0, 0, 2],
    ];
    const result = singularValueDecomposition(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result.rank).toBe(3);
    for (let k = 1; k < result.rank; k++) {
      expect(result.singularValues[k - 1]).toBeGreaterThanOrEqual(result.singularValues[k]);
    }
    expect(result.singularValues[0]).toBeCloseTo(5, 10);
    expect(result.singularValues[1]).toBeCloseTo(3, 10);
    expect(result.singularValues[2]).toBeCloseTo(2, 10);
  });
});

describe('singularValueDecomposition — orthogonality', () => {
  test('3x3 symmetric matrix의 U와 V는 column-orthonormal이다', () => {
    const A = [
      [4, 1, 2],
      [1, 3, 0],
      [2, 0, 2],
    ];
    const result = singularValueDecomposition(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectMatrixCloseTo(
      multiplyMatrices(transpose(result.leftSingularVectors), result.leftSingularVectors),
      identity(result.rank)
    );
    expectMatrixCloseTo(
      multiplyMatrices(transpose(result.rightSingularVectors), result.rightSingularVectors),
      identity(result.rank)
    );
    expectReconstruction(A, result);
  });

  test('right singular vector는 첫 strict non-zero entry가 양수다', () => {
    const A = [
      [3, 2, 2],
      [2, 3, -2],
    ];
    const result = singularValueDecomposition(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    for (let k = 0; k < result.rank; k++) {
      for (let r = 0; r < result.rightSingularVectors.length; r++) {
        const v = result.rightSingularVectors[r][k];
        if (v !== 0) {
          expect(v).toBeGreaterThan(0);
          break;
        }
      }
    }
  });

  test('left singular vector u_k는 sign(v_k)와 일관되게 결정된다 (known answer 2x3)', () => {
    // reference: A = [[3,2,2],[2,3,-2]]. singular values = 5, 3.
    // v_1 = (1/sqrt(2)) * [1, 1, 0]^T (sign convention: 첫 entry 양수).
    // u_1 = A * v_1 / 5 = [5, 5]^T / (sqrt(2) * 5) = [1, 1]^T / sqrt(2).
    // v_2 = (1/sqrt(18)) * [1, -1, 4]^T (sign convention: 첫 entry 양수).
    // u_2 = A * v_2 / 3 = [9, -9]^T / (sqrt(18) * 3) = [1, -1]^T / sqrt(2).
    const A = [
      [3, 2, 2],
      [2, 3, -2],
    ];
    const result = singularValueDecomposition(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    const invSqrt2 = 1 / Math.sqrt(2);
    const invSqrt18 = 1 / Math.sqrt(18);
    // u_1.
    expect(result.leftSingularVectors[0][0]).toBeCloseTo(invSqrt2, 8);
    expect(result.leftSingularVectors[1][0]).toBeCloseTo(invSqrt2, 8);
    // u_2.
    expect(result.leftSingularVectors[0][1]).toBeCloseTo(invSqrt2, 8);
    expect(result.leftSingularVectors[1][1]).toBeCloseTo(-invSqrt2, 8);
    // v_1.
    expect(result.rightSingularVectors[0][0]).toBeCloseTo(invSqrt2, 8);
    expect(result.rightSingularVectors[1][0]).toBeCloseTo(invSqrt2, 8);
    expect(result.rightSingularVectors[2][0]).toBeCloseTo(0, 8);
    // v_2.
    expect(result.rightSingularVectors[0][1]).toBeCloseTo(invSqrt18, 8);
    expect(result.rightSingularVectors[1][1]).toBeCloseTo(-invSqrt18, 8);
    expect(result.rightSingularVectors[2][1]).toBeCloseTo(4 * invSqrt18, 8);
  });
});

describe('singularValueDecomposition — validation', () => {
  test('ragged matrix는 RangeError', () => {
    expect(() =>
      singularValueDecomposition([
        [1, 2],
        [3, 4, 5],
      ] as unknown as readonly (readonly number[])[])
    ).toThrow(RangeError);
  });

  test('one-sided zero shape [[]] 는 RangeError', () => {
    expect(() => singularValueDecomposition([[]])).toThrow(RangeError);
  });

  test('non-finite entry(NaN)는 RangeError', () => {
    expect(() =>
      singularValueDecomposition([
        [1, Number.NaN],
        [0, 1],
      ])
    ).toThrow(RangeError);
  });

  test('non-finite entry(Infinity)는 RangeError', () => {
    expect(() =>
      singularValueDecomposition([
        [Number.POSITIVE_INFINITY, 0],
        [0, 1],
      ])
    ).toThrow(RangeError);
  });

  test('invalid maxIterations(0)는 RangeError', () => {
    expect(() => singularValueDecomposition([[1]], { maxIterations: 0 })).toThrow(RangeError);
  });

  test('invalid maxIterations(Infinity)는 RangeError', () => {
    expect(() => singularValueDecomposition([[1]], { maxIterations: Number.POSITIVE_INFINITY })).toThrow(RangeError);
  });

  test('invalid maxIterations(NaN)은 RangeError', () => {
    expect(() => singularValueDecomposition([[1]], { maxIterations: Number.NaN })).toThrow(RangeError);
  });

  test('invalid maxIterations(MAX_SAFE_INTEGER + 1)은 RangeError', () => {
    expect(() => singularValueDecomposition([[1]], { maxIterations: Number.MAX_SAFE_INTEGER + 1 })).toThrow(RangeError);
  });

  test('invalid tolerance(음수)는 RangeError', () => {
    expect(() => singularValueDecomposition([[1]], { tolerance: -1 })).toThrow(RangeError);
  });

  test('invalid tolerance(-Infinity)는 RangeError', () => {
    expect(() => singularValueDecomposition([[1]], { tolerance: Number.NEGATIVE_INFINITY })).toThrow(RangeError);
  });

  test('invalid epsilon(NaN)은 RangeError', () => {
    expect(() => singularValueDecomposition([[1]], { epsilon: Number.NaN })).toThrow(RangeError);
  });

  test('invalid epsilon(Infinity)는 RangeError', () => {
    expect(() => singularValueDecomposition([[1]], { epsilon: Number.POSITIVE_INFINITY })).toThrow(RangeError);
  });

  test('options 검증이 input 검증보다 먼저 수행된다', () => {
    expect(() => singularValueDecomposition([[1, Number.NaN]], { maxIterations: 0 })).toThrow(/maxIterations/);
  });
});

describe('singularValueDecomposition — convergence cap / -0 cleanup', () => {
  test('낮은 maxIterations로 수렴 실패 시 undefined를 반환한다', () => {
    // 조밀하게 coupled 5x5 matrix.
    const A = [
      [1, 0.5, 0.3, 0.2, 0.1],
      [0.5, 1, 0.4, 0.3, 0.2],
      [0.3, 0.4, 1, 0.5, 0.3],
      [0.2, 0.3, 0.5, 1, 0.4],
      [0.1, 0.2, 0.3, 0.4, 1],
    ];
    expect(singularValueDecomposition(A, { maxIterations: 1, tolerance: 1e-12 })).toBeUndefined();
  });

  test('결과 entry에는 -0이 남지 않는다', () => {
    // A = [[-1, 0], [0, -1]]. singular values = 1, 1.
    const A = [
      [-1, 0],
      [0, -1],
    ];
    const result = singularValueDecomposition(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    for (const row of result.leftSingularVectors) {
      for (const v of row) {
        expect(Object.is(v, -0)).toBe(false);
      }
    }
    for (const row of result.rightSingularVectors) {
      for (const v of row) {
        expect(Object.is(v, -0)).toBe(false);
      }
    }
    for (const v of result.singularValues) {
      expect(Object.is(v, -0)).toBe(false);
    }
  });

  test('1x1 matrix [[a]]는 singular value [|a|]를 반환한다', () => {
    const result = singularValueDecomposition([[7]]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectSvdShape(result, 1, 1, 1);
    expect(result.singularValues[0]).toBeCloseTo(7, 10);
  });

  test('1x1 matrix [[-3]]는 singular value [3]을 반환한다', () => {
    const result = singularValueDecomposition([[-3]]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectSvdShape(result, 1, 1, 1);
    expect(result.singularValues[0]).toBeCloseTo(3, 10);
    expectReconstruction([[-3]], result, 10);
  });

  test('1x1 matrix [[0]]은 rank=0 빈 SVD', () => {
    const result = singularValueDecomposition([[0]]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectSvdShape(result, 1, 1, 0);
  });
});
