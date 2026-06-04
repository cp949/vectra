import { resolveIterationOptions } from './jacobi-eigen.internal';
import { computeThinSingularValueDecomposition } from './svd.internal';
import type { IterationOptions, MatLike } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * rectangular matrix `A`(`m x n`)의 nuclear norm(trace norm), 즉 singular value 합을 반환한다.
 *
 * 정의: `‖A‖_* = Σ sigma_k(A)`. Schatten 1-norm으로도 부른다.
 *
 * - 빈 matrix `[]`(`shape = [0, 0]`)는 `0`을 반환한다.
 * - rank 0(zero matrix)는 `0`을 반환한다.
 * - 그 외에는 SVD singular value를 누적해 합을 반환한다. 매 step에서 누적 합이 finite인지 확인한다.
 * - 누적 합이 non-finite(Infinity)이면 `RangeError`. SVD core 자체의 sigma는 sqrt 결과로 finite이
 *   보장되므로, 누적 합 overflow만 별도로 체크한다.
 *
 * 검증 순서: `resolveIterationOptions` → `extractMatrixShape(matrix)` → `assertFiniteMatrixEntries`
 * → SVD 계산 → 분기. Jacobi convergence 실패와 음수 eigenvalue 같은 numeric failure는 `undefined`.
 *
 * `matrix`는 rectangular nested array여야 한다. ragged matrix와 one-sided zero shape `[[]]`는
 * `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.maxIterations`는 positive safe integer, `options.tolerance`와 `options.epsilon`은 0 이상
 * finite number여야 한다. 위반 시 `RangeError`. `tolerance`는 Jacobi off-diagonal convergence 판정에
 * 사용한다. `epsilon`은 SVD eigenvalue clamp / sigma rank 판정에만 사용하며 input/result finite
 * validation에는 사용하지 않는다.
 * 결과는 항상 `+0` 또는 양수다(`-0`이 남지 않는다).
 *
 * 결과는 fixed scalar를 직접 반환한다(`*Into` variant를 제공하지 않는다).
 *
 * @param matrix nuclear norm을 계산할 source matrix
 * @param options 반복 옵션. 미지정 시 default(`maxIterations=100`, `tolerance=1e-10`, `epsilon=1e-9`).
 */
export function nuclearNorm(matrix: MatLike, options?: IterationOptions): number | undefined {
  const resolved = resolveIterationOptions(options, 'options');
  const shape = extractMatrixShape(matrix, 'matrix');
  assertFiniteMatrixEntries(matrix, shape, 'matrix');
  const svd = computeThinSingularValueDecomposition(matrix, shape, resolved);
  if (svd === undefined) {
    return undefined;
  }
  const { singularValues, rank } = svd;
  if (rank === 0) {
    return 0;
  }
  let sum = 0;
  for (let k = 0; k < rank; k++) {
    sum += singularValues[k];
    if (!Number.isFinite(sum)) {
      throw new RangeError(`nuclearNorm singular value accumulator overflowed at index ${k}, got ${String(sum)}`);
    }
  }
  return sum;
}
