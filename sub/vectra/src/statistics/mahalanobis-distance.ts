import {
  assertSymmetricMatrix,
  choleskyFactor,
  forwardSolveLowerTriangular,
  resolveEpsilon,
} from './multivariate.internal';
import type { MahalanobisOptions } from './types';
import { assertValuesArray } from './validate.internal';

/**
 * `point`와 `mean` 사이의 Mahalanobis distance `sqrt((x - μ)^T Σ^-1 (x - μ))`를 반환한다.
 *
 * `point`/`mean`은 readonly number 배열이어야 하며 길이가 같아야 한다. `covarianceMatrix`는 row-major
 * `readonly (readonly number[])[]`다. ragged/non-square/length mismatch는 `RangeError`. 모든 numeric entry는
 * finite number여야 한다. 위반은 `RangeError`(top-level이 array가 아니면 `TypeError`).
 *
 * `options.epsilon`은 covariance symmetry 허용 오차 + Cholesky pivot SPD 판정 tolerance다. 0 이상 finite number
 * 가 아니면 `RangeError`. 기본 `1e-9`. `epsilon`은 input/result finite validation이나 distance 산술에 사용하지
 * 않는다(tolerance-split).
 *
 * `|cov[i][j] - cov[j][i]|`가 `epsilon`을 초과하면 non-symmetric으로 `RangeError`. Cholesky pivot squared 값
 * (`L[k][k]^2 = cov[k][k] - Σ_{j<k} L[k][j]^2`)이 `epsilon` 이하이면 singular/non-SPD로 `RangeError`.
 *
 * 알고리즘: `Σ = L L^T` Cholesky factorization → `L z = (point - mean)` forward substitution → `distance = ||z||₂`.
 * `point.length === 0`이면 covariance도 `0x0`(빈 matrix)이어야 하며 결과는 `0`이다. 이 함수는 caller가
 * covariance matrix를 외부에서 직접 넘기는 시그니처라 sample/population denominator 선택(`mode`)은 caller 책임이다.
 *
 * 결과 distance는 비음의 finite number다. `-0`은 발생하지 않지만 일관성을 위해 `0`으로 canonicalize한다.
 *
 * @param point 거리를 측정할 point. finite number 배열.
 * @param mean 분포의 평균 vector. `point`와 같은 길이의 finite number 배열.
 * @param covarianceMatrix 분포의 covariance matrix. square symmetric finite SPD matrix(`n x n`).
 * @param options 옵션. `epsilon` 기본 `1e-9`.
 */
export function mahalanobisDistance(
  point: readonly number[],
  mean: readonly number[],
  covarianceMatrix: readonly (readonly number[])[],
  options?: MahalanobisOptions
): number {
  assertValuesArray(point, 'point');
  assertValuesArray(mean, 'mean');
  if (point.length !== mean.length) {
    throw new RangeError(`point.length (${point.length}) must equal mean.length (${mean.length})`);
  }

  const epsilon = resolveEpsilon(options?.epsilon, 'options.epsilon');
  const { n, matrix } = assertSymmetricMatrix(covarianceMatrix, epsilon);
  if (n !== point.length) {
    throw new RangeError(`covarianceMatrix size (${n}) must equal point.length (${point.length})`);
  }

  // n === 0: 빈 vector + 0x0 covariance. distance = 0.
  if (n === 0) return 0;

  // point/mean entry finite 검증과 delta 산출을 함께 수행.
  const delta = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    const p = point[i];
    if (!Number.isFinite(p)) {
      throw new RangeError(`point[${i}] must be a finite number, got ${String(p)}`);
    }
    const m = mean[i];
    if (!Number.isFinite(m)) {
      throw new RangeError(`mean[${i}] must be a finite number, got ${String(m)}`);
    }
    const d = p - m;
    if (!Number.isFinite(d)) {
      throw new RangeError(`mahalanobis delta at index ${i} must be finite, got ${String(d)}`);
    }
    delta[i] = d;
  }

  const L = choleskyFactor(matrix, n, epsilon);
  const z = forwardSolveLowerTriangular(L, delta, n);

  let squared = 0;
  for (let i = 0; i < n; i++) {
    const sq = z[i] * z[i];
    if (!Number.isFinite(sq)) {
      throw new RangeError(`mahalanobis z[${i}]^2 must be finite, got ${String(sq)}`);
    }
    squared += sq;
    if (!Number.isFinite(squared)) {
      throw new RangeError(`mahalanobis squared sum must be finite, got ${String(squared)} at index ${i}`);
    }
  }

  const distance = Math.sqrt(squared);
  if (!Number.isFinite(distance)) {
    throw new RangeError(`mahalanobis distance must be finite, got ${String(distance)}`);
  }
  return Object.is(distance, -0) ? 0 : distance;
}
