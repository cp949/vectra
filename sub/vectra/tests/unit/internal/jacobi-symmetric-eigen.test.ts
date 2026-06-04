/**
 * internal jacobiSymmetricEigenRaw helper 단위 테스트.
 *
 * symmetric finite square matrix에 대한 raw Jacobi eigen 결과, 입력 불변성, 수렴 실패를 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { jacobiSymmetricEigenRaw } from '../../../src/internal/jacobi-symmetric-eigen';

function expectSortedArrayCloseTo(actual: readonly number[], expected: readonly number[], precision = 10): void {
  const a = [...actual].sort((x, y) => x - y);
  const e = [...expected].sort((x, y) => x - y);
  expect(a.length).toBe(e.length);
  for (let i = 0; i < e.length; i++) {
    expect(a[i]).toBeCloseTo(e[i], precision);
  }
}

function dot(a: readonly number[], b: readonly number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

function column(matrix: readonly (readonly number[])[], col: number): number[] {
  const out = new Array<number>(matrix.length);
  for (let r = 0; r < matrix.length; r++) {
    out[r] = matrix[r][col];
  }
  return out;
}

describe('jacobiSymmetricEigenRaw', () => {
  test('symmetric 3x3 matrix의 eigenvalue와 column eigenvector를 계산한다', () => {
    const matrix = [
      [2, -1, 0],
      [-1, 2, -1],
      [0, -1, 2],
    ];
    const before = matrix.map((row) => [...row]);

    const result = jacobiSymmetricEigenRaw(matrix, 3, {
      maxIterations: 100,
      tolerance: 1e-10,
      errorPrefix: 'test Jacobi rotation',
    });

    expect(result).toBeDefined();
    if (result === undefined) return;
    expectSortedArrayCloseTo(result.values, [2 - Math.sqrt(2), 2, 2 + Math.sqrt(2)], 8);
    expect(result.vectors).toHaveLength(3);
    for (const row of result.vectors) {
      expect(row).toHaveLength(3);
    }
    for (let i = 0; i < 3; i++) {
      const eigenvector = column(result.vectors, i);
      const lambda = result.values[i];
      for (let r = 0; r < 3; r++) {
        expect(dot(matrix[r], eigenvector)).toBeCloseTo(lambda * eigenvector[r], 8);
      }
      expect(dot(eigenvector, eigenvector)).toBeCloseTo(1, 10);
      for (let j = i + 1; j < 3; j++) {
        expect(dot(eigenvector, column(result.vectors, j))).toBeCloseTo(0, 10);
      }
    }
    expect(matrix).toEqual(before);
  });

  test('maxIterations 안에 수렴하지 못하면 undefined를 반환한다', () => {
    expect(
      jacobiSymmetricEigenRaw(
        [
          [4, 1, 0],
          [1, 3, 1],
          [0, 1, 2],
        ],
        3,
        {
          maxIterations: 1,
          tolerance: 1e-12,
          errorPrefix: 'test Jacobi rotation',
        }
      )
    ).toBeUndefined();
  });
});
