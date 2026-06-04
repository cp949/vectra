/**
 * mahalanobisDistance / whiten 공유 helper.
 *
 * symmetry/SPD 검증, Cholesky factorization, lower-triangular forward substitution을 모은다. `linalg` public/internal
 * helper를 cross-domain import하지 않기 위해 statistics 자체 helper로 보유한다(같은 정책은 `pca-eigen.internal.ts`의
 * Jacobi와 동일).
 */

import { assertRectangularMatrix } from './matrix.internal';

/** mahalanobis/whitening SPD/symmetry tolerance default. */
export const DEFAULT_MULTIVARIATE_EPSILON = 1e-9;

/**
 * `epsilon` 옵션을 검증한다. 0 이상 finite number가 아니면 `RangeError`.
 *
 * @param epsilonRaw 사용자 옵션 값. `undefined`이면 default를 사용한다.
 * @param name error message에 사용할 옵션 인자 이름
 */
export function resolveEpsilon(epsilonRaw: number | undefined, name: string): number {
  if (epsilonRaw === undefined) return DEFAULT_MULTIVARIATE_EPSILON;
  if (!Number.isFinite(epsilonRaw) || epsilonRaw < 0) {
    throw new RangeError(`${name} must be a finite number >= 0, got ${String(epsilonRaw)}`);
  }
  return epsilonRaw;
}

/**
 * `cov`가 square, finite, symmetric matrix인지 검증한다.
 *
 * `cov`는 row-major `readonly (readonly number[])[]`다. ragged matrix는 `RangeError`. 비-square는 `RangeError`.
 * entry non-finite는 `RangeError`. `|cov[i][j] - cov[j][i]|`이 `epsilon`을 초과하면 non-symmetric으로 `RangeError`.
 *
 * @param cov 검증할 covariance matrix
 * @param epsilon symmetry 허용 오차
 * @param name error message에 사용할 인자 이름. 기본 `"covarianceMatrix"`.
 * @returns matrix 한 변의 길이 `n`
 */
export function assertSymmetricMatrix(
  cov: unknown,
  epsilon: number,
  name = 'covarianceMatrix'
): { n: number; matrix: readonly (readonly number[])[] } {
  const { rowCount, columnCount } = assertRectangularMatrix(cov, name);
  if (rowCount !== columnCount) {
    throw new RangeError(`${name} must be a square matrix, got ${rowCount}x${columnCount}`);
  }
  const n = rowCount;
  const matrix = cov as readonly (readonly number[])[];

  for (let r = 0; r < n; r++) {
    const row = matrix[r];
    for (let c = 0; c < n; c++) {
      const v = row[c];
      if (!Number.isFinite(v)) {
        throw new RangeError(`${name}[${r}][${c}] must be a finite number, got ${String(v)}`);
      }
    }
  }
  for (let r = 0; r < n; r++) {
    for (let c = r + 1; c < n; c++) {
      const diff = matrix[r][c] - matrix[c][r];
      if (Math.abs(diff) > epsilon) {
        throw new RangeError(
          `${name} must be symmetric within epsilon ${epsilon}: |${name}[${r}][${c}] - ${name}[${c}][${r}]| = ${Math.abs(diff)}`
        );
      }
    }
  }
  return { n, matrix };
}

/**
 * symmetric finite square matrix `cov`(`n x n`)의 Cholesky-Banachiewicz lower factor `L`을 계산한다.
 *
 * `cov = L * L^T`이고 `L`은 lower-triangular matrix다. caller는 `cov`가 `assertSymmetricMatrix` 결과임을 보장한다.
 *
 * pivot squared 값(`L[k][k]^2 = cov[k][k] - Σ_{j<k} L[k][j]^2`)이 `epsilon` 이하이면 singular/non-SPD로 `RangeError`.
 * sqrt/division 결과가 non-finite이거나 누적 sum이 non-finite면 `RangeError`. 결과 lower factor는 fresh `number[][]`이다.
 *
 * @param cov symmetric finite square matrix(`n x n`)
 * @param n matrix 한 변의 길이
 * @param epsilon SPD pivot 판정 tolerance
 */
export function choleskyFactor(cov: readonly (readonly number[])[], n: number, epsilon: number): number[][] {
  const L: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    L[r] = new Array<number>(n);
    for (let c = 0; c < n; c++) L[r][c] = 0;
  }

  for (let r = 0; r < n; r++) {
    for (let c = 0; c <= r; c++) {
      let sum = 0;
      for (let k = 0; k < c; k++) {
        const product = L[r][k] * L[c][k];
        if (!Number.isFinite(product)) {
          throw new RangeError(`Cholesky product at (${r}, ${c}, ${k}) must be finite, got ${String(product)}`);
        }
        sum += product;
        if (!Number.isFinite(sum)) {
          throw new RangeError(`Cholesky sum at (${r}, ${c}, ${k}) must be finite, got ${String(sum)}`);
        }
      }
      if (r === c) {
        const diag = cov[r][r] - sum;
        if (!Number.isFinite(diag)) {
          throw new RangeError(`Cholesky diagonal at (${r}) must be finite, got ${String(diag)}`);
        }
        // SPD 위반: pivot squared 값(`diag = cov[r][r] - sum = L[r][r]^2`)이 epsilon 이하이면 singular 처리.
        if (diag <= epsilon) {
          throw new RangeError(
            `covarianceMatrix is not symmetric positive-definite at pivot ${r} (value ${diag} <= epsilon ${epsilon})`
          );
        }
        const root = Math.sqrt(diag);
        if (!Number.isFinite(root) || root === 0) {
          throw new RangeError(`Cholesky sqrt at (${r}) must be finite non-zero, got ${String(root)}`);
        }
        L[r][r] = root;
      } else {
        const numerator = cov[r][c] - sum;
        if (!Number.isFinite(numerator)) {
          throw new RangeError(`Cholesky numerator at (${r}, ${c}) must be finite, got ${String(numerator)}`);
        }
        const value = numerator / L[c][c];
        if (!Number.isFinite(value)) {
          throw new RangeError(`Cholesky off-diagonal at (${r}, ${c}) must be finite, got ${String(value)}`);
        }
        L[r][c] = value;
      }
    }
  }
  return L;
}

/**
 * lower-triangular matrix `L`(`n x n`)에 대해 `L * z = b`를 forward substitution으로 푼다.
 *
 * caller는 `L`이 `choleskyFactor` 결과이고 모든 diagonal entry가 0이 아님을 보장한다. division/sum/subtraction
 * 결과가 non-finite면 `RangeError`. 결과 `z`는 fresh `number[]`(length `n`)다.
 *
 * @param L lower-triangular finite matrix
 * @param b right-hand side vector
 * @param n matrix/vector 한 변의 길이
 */
export function forwardSolveLowerTriangular(
  L: readonly (readonly number[])[],
  b: readonly number[],
  n: number
): number[] {
  const z = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let k = 0; k < i; k++) {
      const product = L[i][k] * z[k];
      if (!Number.isFinite(product)) {
        throw new RangeError(`forward solve product at (${i}, ${k}) must be finite, got ${String(product)}`);
      }
      sum += product;
      if (!Number.isFinite(sum)) {
        throw new RangeError(`forward solve sum at (${i}, ${k}) must be finite, got ${String(sum)}`);
      }
    }
    const numerator = b[i] - sum;
    if (!Number.isFinite(numerator)) {
      throw new RangeError(`forward solve numerator at (${i}) must be finite, got ${String(numerator)}`);
    }
    const value = numerator / L[i][i];
    if (!Number.isFinite(value)) {
      throw new RangeError(`forward solve result at (${i}) must be finite, got ${String(value)}`);
    }
    z[i] = value;
  }
  return z;
}
