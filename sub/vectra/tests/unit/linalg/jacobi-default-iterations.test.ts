/**
 * Jacobi 기반 함수의 `maxIterations` 기본값 단위 테스트.
 *
 * 규칙은 `IterationOptions` JSDoc이 소유한다. 미지정이면 `max(100, 10 * n * (n - 1) / 2)`회 rotation이다.
 * 이전에는 크기와 무관하게 100회라서 무작위 10차 조밀 대칭 matrix도 조용히 `undefined`였다.
 * eig, calculateEigenvalues, singularValueDecomposition, pca가 같은 규칙을 쓰는지 고정한다.
 */

import { describe, expect, test } from 'vitest';
import { calculateEigenvalues } from '../../../src/linalg/calculate-eigenvalues';
import { eig } from '../../../src/linalg/eig';
import { singularValueDecomposition } from '../../../src/linalg/singular-value-decomposition';
import { pca } from '../../../src/statistics/pca';

/**
 * seed 고정 선형 합동 난수. `[0, 1)`을 반환하는 함수를 만든다.
 *
 * 테스트 입력이 실행마다 같도록 `Math.random` 대신 쓴다.
 */
function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** entry가 `[-1, 1)`인 무작위 조밀 `n x n` symmetric matrix를 만든다. */
function randomSymmetric(n: number, seed: number): number[][] {
  const rng = makeRng(seed);
  const a = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const v = rng() * 2 - 1;
      a[i][j] = v;
      a[j][i] = v;
    }
  }
  return a;
}

/** `A * v_k - values[k] * v_k`의 최대 절대 잔차. column `k`가 `values[k]`의 eigenvector다. */
function maxEigenResidual(a: readonly (readonly number[])[], values: readonly number[], vectors: number[][]): number {
  const n = a.length;
  let worst = 0;
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        sum += a[i][j] * vectors[j][k];
      }
      worst = Math.max(worst, Math.abs(sum - values[k] * vectors[i][k]));
    }
  }
  return worst;
}

describe('eig — maxIterations 미지정 기본값', () => {
  // 필요한 rotation은 약 1.0 ~ 2.2 n²회다. n = 10도 약 160회라서 이전 고정값 100으로는 모자랐다.
  test.each([10, 20, 40, 60, 100])('무작위 조밀 symmetric %i차는 수렴한다', (n) => {
    const a = randomSymmetric(n, 1000 + n);
    const result = eig(a);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result.values).toHaveLength(n);
    expect(maxEigenResidual(a, result.values, result.vectors)).toBeLessThan(1e-8);
    const trace = a.reduce((acc, row, i) => acc + row[i], 0);
    const valueSum = result.values.reduce((acc, v) => acc + v, 0);
    expect(valueSum).toBeCloseTo(trace, 8);
  });

  // 같은 rotation 순서를 밟으므로 기본값과 충분히 큰 명시값의 결과는 비트 단위로 같아야 한다.
  test('수렴한 결과는 충분히 큰 명시 maxIterations의 결과와 같다', () => {
    for (const n of [6, 10, 20]) {
      const a = randomSymmetric(n, 2000 + n);
      expect(eig(a)).toEqual(eig(a, { maxIterations: 1_000_000 }));
    }
  });

  test('이전 기본값 100 안에 수렴하던 작은 입력은 그대로 수렴한다', () => {
    const diagonal = [
      [3, 0, 0],
      [0, 1, 0],
      [0, 0, 2],
    ];
    expect(eig(diagonal)).toEqual({
      values: [3, 1, 2],
      vectors: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
    });
    const small = [
      [2, 1],
      [1, 2],
    ];
    const result = eig(small);
    expect(result?.values[0]).toBeCloseTo(1, 12);
    expect(result?.values[1]).toBeCloseTo(3, 12);
  });

  test('명시한 maxIterations는 크기와 무관하게 그 값 그대로 상한이다', () => {
    const a = randomSymmetric(60, 3000);
    expect(eig(a)).toBeDefined();
    expect(eig(a, { maxIterations: 100 })).toBeUndefined();
    expect(eig(a, { maxIterations: 3000 })).toBeUndefined();
    expect(eig(a, { maxIterations: 100_000 })).toBeDefined();
  });
});

describe('Jacobi를 쓰는 다른 함수도 같은 기본값을 쓴다', () => {
  test('calculateEigenvalues는 60차 symmetric matrix에서 eig와 같은 eigenvalue를 준다', () => {
    const a = randomSymmetric(60, 5000);
    const values = calculateEigenvalues(a);
    expect(values).toBeDefined();
    expect(values).toEqual(eig(a)?.values);
  });

  test('singularValueDecomposition은 열이 60개인 matrix에서 수렴한다', () => {
    const rng = makeRng(6000);
    const matrix = Array.from({ length: 70 }, () => Array.from({ length: 60 }, () => rng() * 2 - 1));
    const result = singularValueDecomposition(matrix);
    expect(result).toBeDefined();
    expect(result?.singularValues).toHaveLength(60);
    expect(result?.rank).toBe(60);
  });

  test('pca는 변수가 60개인 data에서 수렴한다', () => {
    const rng = makeRng(7000);
    const data = Array.from({ length: 200 }, () => Array.from({ length: 60 }, () => rng() * 2 - 1));
    const result = pca(data);
    expect(result).toBeDefined();
    expect(result?.rank).toBe(60);
  });
});
