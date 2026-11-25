/**
 * `tolerance: 0`의 Jacobi 반복 동작 테스트.
 *
 * 비대각 원소가 정확히 0이 될 때까지 반복해도 rotation 계산이 유한한 값만 내는지 확인한다.
 * 이전 구현은 비대각 원소가 0에 가까워지면 `theta = (Aqq - App) / (2 * Apq)`가 overflow해
 * `non-finite theta` 또는 `non-finite denominator` `RangeError`를 던졌다.
 * `tolerance > 0`의 비트 동일성은 `tests/unit/internal/jacobi-symmetric-eigen-equivalence.test.ts`가 고정한다.
 * 같은 Jacobi 경로를 쓰는 공개 함수가 `tolerance: 0`에서 일관되게 동작하는지도 함께 확인한다.
 */
import { describe, expect, test } from 'vitest';
import { calculateEigenvalues } from '../../../src/linalg/calculate-eigenvalues';
import { columnSpace } from '../../../src/linalg/column-space';
import { conditionNumber } from '../../../src/linalg/condition-number';
import { eig } from '../../../src/linalg/eig';
import { nuclearNorm } from '../../../src/linalg/nuclear-norm';
import { nullSpace } from '../../../src/linalg/null-space';
import { pseudoInverse } from '../../../src/linalg/pseudo-inverse';
import { rankBasis } from '../../../src/linalg/rank-basis';
import { singularValueDecomposition } from '../../../src/linalg/singular-value-decomposition';
import { solveUnderdeterminedSystem } from '../../../src/linalg/solve-underdetermined-system';
import { spectralNorm } from '../../../src/linalg/spectral-norm';
import { createRng } from '../../../src/random/create-rng';
import { pca } from '../../../src/statistics/pca';

const ZERO = { tolerance: 0 } as const;

/** `[-1, 1)` 균등 난수로 채운 조밀 symmetric matrix. */
function randomSymmetric(n: number, rng: () => number): number[][] {
  const m = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const v = rng() * 2 - 1;
      m[i][j] = v;
      m[j][i] = v;
    }
  }
  return m;
}

/** `[-1, 1)` 균등 난수로 채운 `rows x columns` matrix. */
function randomMatrix(rows: number, columns: number, rng: () => number): number[][] {
  return Array.from({ length: rows }, () => Array.from({ length: columns }, () => rng() * 2 - 1));
}

/** `max |A * v_i - values[i] * v_i|`. column matrix `vectors`의 i번째 column이 `values[i]`에 대응한다. */
function eigenResidual(matrix: readonly number[][], values: readonly number[], vectors: readonly number[][]): number {
  const n = matrix.length;
  let worst = 0;
  for (let c = 0; c < n; c++) {
    for (let i = 0; i < n; i++) {
      let av = 0;
      for (let j = 0; j < n; j++) {
        av += matrix[i][j] * vectors[j][c];
      }
      worst = Math.max(worst, Math.abs(av - values[c] * vectors[i][c]));
    }
  }
  return worst;
}

describe('eig tolerance: 0', () => {
  test('대각 matrix는 rotation 없이 대각을 eigenvalue로 반환한다', () => {
    const result = eig(
      [
        [3, 0, 0],
        [0, 1, 0],
        [0, 0, 2],
      ],
      ZERO
    );
    expect(result?.values).toEqual([3, 1, 2]);
    expect(result?.vectors).toEqual([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
  });

  test('이미 수렴한 matrix(rotation 한 번 뒤의 대각 matrix)를 다시 넣어도 같은 결과다', () => {
    const first = eig(
      [
        [2, 1],
        [1, 2],
      ],
      ZERO
    );
    expect(first).toBeDefined();
    const diagonal = [
      [first!.values[0], 0],
      [0, first!.values[1]],
    ];
    const second = eig(diagonal, ZERO);
    expect(second?.values).toEqual(first!.values);
    expect(second?.vectors).toEqual([
      [1, 0],
      [0, 1],
    ]);
  });

  test('영 matrix는 영 eigenvalue와 단위 matrix를 반환한다', () => {
    const result = eig(
      [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
      ZERO
    );
    expect(result?.values).toEqual([0, 0, 0]);
    expect(result?.vectors).toEqual([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
  });

  test('크기 1은 Jacobi 없이 값을 그대로 반환한다', () => {
    expect(eig([[5]], ZERO)).toEqual({ values: [5], vectors: [[1]] });
  });

  test('크기 2 symmetric matrix의 eigenvalue는 3과 1이다', () => {
    const result = eig(
      [
        [2, 1],
        [1, 2],
      ],
      ZERO
    );
    expect(result).toBeDefined();
    expect([...result!.values].sort((a, b) => b - a)).toEqual([3, 1].map((v) => expect.closeTo(v, 12)));
  });

  // seed 1에서 5, 8, 20 크기는 이전 구현이 `non-finite theta` 또는 `non-finite denominator`를 던졌다.
  test('일반 symmetric matrix는 throw 없이 수렴하고 A * V = V * D를 만족한다', () => {
    const rng = createRng(1);
    for (const n of [3, 4, 5, 8, 20]) {
      const matrix = randomSymmetric(n, rng);
      const result = eig(matrix, ZERO);
      expect(result).toBeDefined();
      expect(eigenResidual(matrix, result!.values, result!.vectors)).toBeLessThan(1e-12);
    }
  });

  test('여러 크기와 matrix에서 throw 없이 수렴한다', () => {
    const rng = createRng('eig-zero-tolerance-sweep');
    for (let n = 2; n <= 24; n++) {
      for (let k = 0; k < 4; k++) {
        const matrix = randomSymmetric(n, rng);
        const result = eig(matrix, ZERO);
        expect(result).toBeDefined();
        expect(eigenResidual(matrix, result!.values, result!.vectors)).toBeLessThan(1e-12);
      }
    }
  });

  test('tolerance 0과 기본 tolerance의 eigenvalue는 1e-9 안에서 같다', () => {
    const rng = createRng(11);
    const matrix = randomSymmetric(8, rng);
    const exact = calculateEigenvalues(matrix, ZERO);
    const loose = calculateEigenvalues(matrix);
    expect(exact).toBeDefined();
    expect(loose).toBeDefined();
    const sortedExact = [...exact!].sort((a, b) => a - b);
    const sortedLoose = [...loose!].sort((a, b) => a - b);
    for (let i = 0; i < sortedExact.length; i++) {
      expect(sortedExact[i]).toBeCloseTo(sortedLoose[i], 9);
    }
  });

  test('maxIterations가 작아 정확히 0이 되지 못하면 undefined다', () => {
    const rng = createRng(2);
    const matrix = randomSymmetric(5, rng);
    expect(eig(matrix, { tolerance: 0, maxIterations: 1 })).toBeUndefined();
    expect(eig(matrix, { tolerance: 0, maxIterations: 5 })).toBeUndefined();
  });

  test('이미 대각인 matrix는 maxIterations가 1이어도 수렴한다', () => {
    const result = eig(
      [
        [2, 0],
        [0, 1],
      ],
      { tolerance: 0, maxIterations: 1 }
    );
    expect(result?.values).toEqual([2, 1]);
  });

  test('음수 tolerance는 계속 RangeError다', () => {
    expect(() => eig([[1]], { tolerance: -1 })).toThrow(/options\.tolerance must be a finite number >= 0/);
  });
});

describe('tolerance: 0을 받는 다른 공개 함수', () => {
  const rng = createRng(3);
  const symmetric = randomSymmetric(6, rng);
  const tall = randomMatrix(7, 4, rng);
  const wide = randomMatrix(3, 6, rng);
  const rankDeficient = [
    [1, 2, 3],
    [2, 4, 6],
    [1, 0, 1],
  ];

  test('calculateEigenvalues는 값을 반환한다', () => {
    expect(calculateEigenvalues(symmetric, ZERO)).toHaveLength(6);
  });

  test('singularValueDecomposition은 A = U * S * V^T를 만족한다', () => {
    const svd = singularValueDecomposition(tall, ZERO);
    expect(svd).toBeDefined();
    const { leftSingularVectors: u, singularValues: s, rightSingularVectors: v } = svd!;
    for (let i = 0; i < tall.length; i++) {
      for (let j = 0; j < tall[0].length; j++) {
        let value = 0;
        for (let k = 0; k < s.length; k++) {
          value += u[i][k] * s[k] * v[j][k];
        }
        expect(value).toBeCloseTo(tall[i][j], 9);
      }
    }
  });

  test('spectralNorm, nuclearNorm, conditionNumber는 기본 tolerance 결과와 1e-9 안에서 같다', () => {
    expect(spectralNorm(tall, ZERO)).toBeCloseTo(spectralNorm(tall)!, 9);
    expect(nuclearNorm(tall, ZERO)).toBeCloseTo(nuclearNorm(tall)!, 9);
    expect(conditionNumber(tall, ZERO)).toBeCloseTo(conditionNumber(tall)!, 6);
  });

  test('pseudoInverse는 A * A^+ * A = A를 만족한다', () => {
    const inverse = pseudoInverse(wide, ZERO);
    expect(inverse).toBeDefined();
    // wide(3x6) * inverse(6x3) = I3이다(full row rank).
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let value = 0;
        for (let k = 0; k < 6; k++) {
          value += wide[i][k] * inverse![k][j];
        }
        expect(value).toBeCloseTo(i === j ? 1 : 0, 9);
      }
    }
  });

  test('columnSpace, rankBasis, nullSpace는 rank 2 matrix에서 기본 tolerance와 같은 기저를 반환한다', () => {
    expect(columnSpace(rankDeficient, ZERO)).toHaveLength(2);
    expect(rankBasis(rankDeficient, ZERO)).toEqual(rankBasis(rankDeficient));
    expect(nullSpace(rankDeficient, ZERO)).toEqual(nullSpace(rankDeficient));
  });

  test('solveUnderdeterminedSystem은 A * x = b를 만족하는 해를 반환한다', () => {
    const b = [1, 2, 3];
    const x = solveUnderdeterminedSystem(wide, b, ZERO);
    expect(x).toBeDefined();
    for (let i = 0; i < 3; i++) {
      let value = 0;
      for (let k = 0; k < 6; k++) {
        value += wide[i][k] * x![k];
      }
      expect(value).toBeCloseTo(b[i], 9);
    }
  });

  test('pca는 throw 없이 explainedVarianceRatio 합이 1이다', () => {
    const data = randomMatrix(40, 6, createRng(4));
    const result = pca(data, ZERO);
    expect(result).toBeDefined();
    const sum = result!.explainedVarianceRatio.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 12);
  });

  test('pca는 maxIterations가 작으면 undefined다', () => {
    const data = randomMatrix(40, 6, createRng(4));
    expect(pca(data, { tolerance: 0, maxIterations: 3 })).toBeUndefined();
  });
});
