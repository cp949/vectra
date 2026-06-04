/**
 * eigenvectorForEigenvalue 함수 단위 테스트.
 *
 * diagonal / symmetric 2x2, 3x3 정상 입력, A * v = lambda * v 검증,
 * unit norm / sign convention, non-eigenvalue 케이스, validation 오류를 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { eigenvectorForEigenvalue } from '../../../src/linalg/eigenvector-for-eigenvalue';

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

describe('eigenvectorForEigenvalue — 정상 입력', () => {
  test('diagonal matrix는 canonical basis eigenvector를 반환한다', () => {
    const A = [
      [2, 0, 0],
      [0, 5, 0],
      [0, 0, -3],
    ];
    const v0 = eigenvectorForEigenvalue(A, 2);
    const v1 = eigenvectorForEigenvalue(A, 5);
    const v2 = eigenvectorForEigenvalue(A, -3);
    expect(v0).toEqual([1, 0, 0]);
    expect(v1).toEqual([0, 1, 0]);
    expect(v2).toEqual([0, 0, 1]);
  });

  test('symmetric 2x2 matrix의 eigenvector는 A * v = lambda * v를 만족한다', () => {
    // A = [[2, 1], [1, 2]]. eigenvalues 3, 1.
    const A = [
      [2, 1],
      [1, 2],
    ];
    const v3 = eigenvectorForEigenvalue(A, 3);
    const v1 = eigenvectorForEigenvalue(A, 1);
    expect(v3).toBeDefined();
    expect(v1).toBeDefined();
    if (v3 === undefined || v1 === undefined) return;
    expectUnitWithPositiveLeadSign(v3);
    expectUnitWithPositiveLeadSign(v1);
    expectEigenEquation(A, v3, 3);
    expectEigenEquation(A, v1, 1);
  });

  test('symmetric 3x3 matrix의 eigenvector도 A * v = lambda * v를 만족한다', () => {
    const A = [
      [2, -1, 0],
      [-1, 2, -1],
      [0, -1, 2],
    ];
    const lambda = 2;
    const v = eigenvectorForEigenvalue(A, lambda);
    expect(v).toBeDefined();
    if (v === undefined) return;
    expectUnitWithPositiveLeadSign(v);
    expectEigenEquation(A, v, lambda, 8);
  });

  test('1x1 matrix는 [1]을 반환한다(lambda가 entry와 같으면)', () => {
    expect(eigenvectorForEigenvalue([[5]], 5)).toEqual([1]);
    expect(eigenvectorForEigenvalue([[-2]], -2)).toEqual([1]);
  });

  test('repeated eigenvalue에 대해 deterministic 단일 vector를 반환한다', () => {
    // identity 2x2의 eigenvalue는 1 (중복). nullspace는 전체 R^2이지만 deterministic하게 마지막
    // free variable 우선 정책으로 [0, 1]을 반환.
    const I = [
      [1, 0],
      [0, 1],
    ];
    const v = eigenvectorForEigenvalue(I, 1);
    expect(v).toBeDefined();
    if (v === undefined) return;
    expectUnitWithPositiveLeadSign(v);
    expectEigenEquation(I, v, 1);
    // 두 번 호출해도 같은 vector.
    expect(eigenvectorForEigenvalue(I, 1)).toEqual(v);
  });

  test('결과 vector에는 -0이 남지 않는다', () => {
    const A = [
      [0, 1],
      [1, 0],
    ];
    const v = eigenvectorForEigenvalue(A, -1);
    expect(v).toBeDefined();
    if (v === undefined) return;
    for (const entry of v) {
      expect(Object.is(entry, -0)).toBe(false);
    }
  });
});

describe('eigenvectorForEigenvalue — eigenvalue 아님', () => {
  test('non-eigenvalue lambda는 undefined를 반환한다', () => {
    // A = diag(2, 3). lambda=4는 eigenvalue가 아니다.
    expect(
      eigenvectorForEigenvalue(
        [
          [2, 0],
          [0, 3],
        ],
        4
      )
    ).toBeUndefined();
  });

  test('symmetric matrix에서 lambda가 다르면 undefined', () => {
    expect(
      eigenvectorForEigenvalue(
        [
          [2, 1],
          [1, 2],
        ],
        5
      )
    ).toBeUndefined();
  });

  test('빈 matrix []는 항상 undefined', () => {
    expect(eigenvectorForEigenvalue([], 0)).toBeUndefined();
  });
});

describe('eigenvectorForEigenvalue — validation', () => {
  test('non-finite lambda(NaN)는 RangeError', () => {
    expect(() => eigenvectorForEigenvalue([[1]], Number.NaN)).toThrow(RangeError);
  });

  test('non-finite lambda(Infinity)는 RangeError', () => {
    expect(() => eigenvectorForEigenvalue([[1]], Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });

  test('non-finite lambda(-Infinity)는 RangeError', () => {
    expect(() => eigenvectorForEigenvalue([[1]], Number.NEGATIVE_INFINITY)).toThrow(RangeError);
  });

  test('non-square matrix는 RangeError', () => {
    expect(() =>
      eigenvectorForEigenvalue(
        [
          [1, 2, 3],
          [4, 5, 6],
        ],
        1
      )
    ).toThrow(RangeError);
  });

  test('non-finite entry는 RangeError', () => {
    expect(() =>
      eigenvectorForEigenvalue(
        [
          [1, Number.NaN],
          [0, 1],
        ],
        1
      )
    ).toThrow(RangeError);
  });

  test('invalid options(epsilon 음수)는 RangeError', () => {
    expect(() => eigenvectorForEigenvalue([[1]], 1, { epsilon: -1 })).toThrow(RangeError);
  });

  test('options 검증이 lambda 검증보다 먼저 수행된다', () => {
    expect(() => eigenvectorForEigenvalue([[1]], Number.NaN, { epsilon: -1 })).toThrow(/epsilon/);
  });
});
