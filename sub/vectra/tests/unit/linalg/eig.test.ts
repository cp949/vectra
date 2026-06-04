/**
 * eig 함수 단위 테스트.
 *
 * values / vectors 대응, A * V = V * diag(values) 검증,
 * repeated eigenvalue 및 column orthonormality,
 * unsupported / failure 케이스, validation 오류를 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { eig } from '../../../src/linalg/eig';
import { multiplyMatrices } from '../../../src/linalg/multiply-matrices';

/**
 * 실수 배열이 element-wise로 expected와 가까운지 검증한다.
 *
 * length가 다르면 즉시 실패. `toBeCloseTo`의 precision으로 digit 단위 허용 오차를 지정한다.
 */
function expectArrayCloseTo(actual: readonly number[], expected: readonly number[], precision = 10): void {
  expect(actual.length).toBe(expected.length);
  for (let i = 0; i < expected.length; i++) {
    expect(actual[i]).toBeCloseTo(expected[i], precision);
  }
}

/**
 * `vector`가 unit norm이고 첫 strict non-zero entry가 양수임을 검증한다.
 *
 * sign convention이 일관되게 적용되는지 확인할 때 사용한다.
 */
function expectUnitWithPositiveLeadSign(vector: readonly number[], precision = 10): void {
  let normSquared = 0;
  for (const v of vector) {
    normSquared += v * v;
  }
  expect(Math.sqrt(normSquared)).toBeCloseTo(1, precision);
  for (const v of vector) {
    if (v !== 0) {
      expect(v).toBeGreaterThan(0);
      return;
    }
  }
}

/**
 * `A * v`가 `lambda * v`와 element-wise로 가까운지 검증한다.
 *
 * eigenvector 정확도를 수치적으로 확인할 때 사용한다.
 */
function expectEigenEquation(
  A: readonly (readonly number[])[],
  v: readonly number[],
  lambda: number,
  precision = 10
): void {
  for (let i = 0; i < A.length; i++) {
    let sum = 0;
    for (let j = 0; j < v.length; j++) {
      sum += A[i][j] * v[j];
    }
    expect(sum).toBeCloseTo(lambda * v[i], precision);
  }
}

/**
 * `n x n` matrix가 column-orthonormal (`V^T V = I`)인지 검증한다.
 *
 * Jacobi V가 직교성을 유지하는지 확인할 때 사용한다.
 */
function expectColumnOrthonormal(vectors: readonly (readonly number[])[], n: number, precision = 8): void {
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let dot = 0;
      for (let r = 0; r < n; r++) {
        dot += vectors[r][i] * vectors[r][j];
      }
      expect(dot).toBeCloseTo(i === j ? 1 : 0, precision);
    }
  }
}

describe('eig — 정상 입력', () => {
  test('빈 matrix []는 { values: [], vectors: [] }를 반환한다', () => {
    expect(eig([])).toEqual({ values: [], vectors: [] });
  });

  test('1x1 matrix [[7]]는 values=[7], vectors=[[1]]', () => {
    expect(eig([[7]])).toEqual({ values: [7], vectors: [[1]] });
  });

  test('symmetric 2x2는 values와 vectors가 대응한다(A * V = V * diag(values))', () => {
    const A = [
      [2, 1],
      [1, 2],
    ];
    const result = eig(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result.values.length).toBe(2);
    expect(result.vectors.length).toBe(2);
    for (const row of result.vectors) {
      expect(row.length).toBe(2);
    }
    // 각 column이 unit norm + lead-positive sign.
    for (let i = 0; i < 2; i++) {
      const col = [result.vectors[0][i], result.vectors[1][i]];
      expectUnitWithPositiveLeadSign(col);
      expectEigenEquation(A, col, result.values[i]);
    }
  });

  test('symmetric 3x3는 A * V = V * diag(values)를 만족한다', () => {
    const A = [
      [2, -1, 0],
      [-1, 2, -1],
      [0, -1, 2],
    ];
    const result = eig(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result.values.length).toBe(3);
    expect(result.vectors.length).toBe(3);
    for (const row of result.vectors) {
      expect(row.length).toBe(3);
    }
    // 비교: A * V == V * diag(values).
    const AV = multiplyMatrices(A, result.vectors);
    for (let r = 0; r < 3; r++) {
      for (let i = 0; i < 3; i++) {
        expect(AV[r][i]).toBeCloseTo(result.vectors[r][i] * result.values[i], 8);
      }
    }
  });

  test('diagonal matrix는 values=diagonal, vectors=identity', () => {
    const A = [
      [3, 0, 0],
      [0, 5, 0],
      [0, 0, -2],
    ];
    const result = eig(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    // Jacobi가 즉시 수렴해 diagonal 그대로 반환. vectors는 단위 행렬.
    expectArrayCloseTo(result.values, [3, 5, -2]);
    expect(result.vectors).toEqual([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
  });

  test('결과에는 -0이 남지 않는다', () => {
    const result = eig([[-0]]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(Object.is(result.values[0], -0)).toBe(false);
    expect(Object.is(result.vectors[0][0], -0)).toBe(false);
  });
});

describe('eig — repeated eigenvalue 및 orthogonality', () => {
  test('identity 3x3은 orthogonal V를 반환한다(repeated eigenvalue 1, multiplicity 3)', () => {
    // BLOCKER 회귀 방지: nullspace 경로로 만들면 세 column이 모두 동일 vector가 되어 V가 singular다.
    // 현재 eig는 symmetric n>=2를 Jacobi V로 처리하므로 V는 orthogonal이어야 한다.
    const I3 = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
    const result = eig(I3);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectArrayCloseTo(result.values, [1, 1, 1]);
    expectColumnOrthonormal(result.vectors, 3);
    // A * V == V * diag(values) 즉 V * I = V.
    const AV = multiplyMatrices(I3, result.vectors);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        expect(AV[r][c]).toBeCloseTo(result.vectors[r][c], 8);
      }
    }
  });

  test('scaled identity 3x3 (eigenvalue 2 multiplicity 3)도 orthogonal V를 반환한다', () => {
    const A = [
      [2, 0, 0],
      [0, 2, 0],
      [0, 0, 2],
    ];
    const result = eig(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectArrayCloseTo(result.values, [2, 2, 2]);
    expectColumnOrthonormal(result.vectors, 3);
  });

  test('symmetric 3x3 with eigenvalue multiplicity 2 (e.g. diag(2,2,5))는 orthogonal V를 반환한다', () => {
    const A = [
      [2, 0, 0],
      [0, 2, 0],
      [0, 0, 5],
    ];
    const result = eig(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectColumnOrthonormal(result.vectors, 3);
    // A * V == V * diag(values).
    const AV = multiplyMatrices(A, result.vectors);
    for (let r = 0; r < 3; r++) {
      for (let i = 0; i < 3; i++) {
        expect(AV[r][i]).toBeCloseTo(result.vectors[r][i] * result.values[i], 8);
      }
    }
  });

  test('symmetric 2x2 scaled identity도 orthogonal V를 반환한다', () => {
    const A = [
      [3, 0],
      [0, 3],
    ];
    const result = eig(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectArrayCloseTo(result.values, [3, 3]);
    expectColumnOrthonormal(result.vectors, 2);
  });
});

describe('eig — unsupported / failure', () => {
  test('2x2 complex pair는 undefined', () => {
    expect(
      eig([
        [0, -1],
        [1, 0],
      ])
    ).toBeUndefined();
  });

  test('nonsymmetric n >= 3은 undefined', () => {
    expect(
      eig([
        [1, 2, 3],
        [0, 4, 5],
        [0, 0, 6],
      ])
    ).toBeUndefined();
  });

  test('nonsymmetric 2x2 repeated real eigenvalue(Jordan block)는 undefined', () => {
    // A = [[2, 1], [0, 2]]는 trace=4, disc=0, repeated eigenvalue 2.
    // 이 nonsymmetric 행렬은 algebraic multiplicity=2지만 geometric multiplicity=1인 Jordan block이다.
    // 두 linearly independent eigenvector를 만들 수 없으므로 undefined.
    expect(
      eig([
        [2, 1],
        [0, 2],
      ])
    ).toBeUndefined();
  });

  test('nonsymmetric 2x2 distinct real eigenvalue는 정상적으로 처리한다', () => {
    // A = [[2, 1], [0, 3]] upper triangular. eigenvalues = 3, 2 (closed form 순서: trace + sqrt).
    const A = [
      [2, 1],
      [0, 3],
    ];
    const result = eig(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectArrayCloseTo(result.values, [3, 2]);
    for (let i = 0; i < 2; i++) {
      const col = [result.vectors[0][i], result.vectors[1][i]];
      expectUnitWithPositiveLeadSign(col);
      expectEigenEquation(A, col, result.values[i]);
    }
  });

  test('낮은 maxIterations로 수렴 실패 시 undefined', () => {
    const A = [
      [1, 0.5, 0.3, 0.2, 0.1],
      [0.5, 1, 0.4, 0.3, 0.2],
      [0.3, 0.4, 1, 0.5, 0.3],
      [0.2, 0.3, 0.5, 1, 0.4],
      [0.1, 0.2, 0.3, 0.4, 1],
    ];
    expect(eig(A, { maxIterations: 1, tolerance: 1e-12 })).toBeUndefined();
  });
});

describe('eig — validation', () => {
  test('non-square는 RangeError', () => {
    expect(() =>
      eig([
        [1, 2, 3],
        [4, 5, 6],
      ])
    ).toThrow(RangeError);
  });

  test('non-finite entry는 RangeError', () => {
    expect(() =>
      eig([
        [1, Number.NaN],
        [0, 1],
      ])
    ).toThrow(RangeError);
  });

  test('invalid options(maxIterations)는 RangeError', () => {
    expect(() => eig([[1]], { maxIterations: 0 })).toThrow(RangeError);
  });
});
