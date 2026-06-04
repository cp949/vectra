import { prepareSvdForPseudoInverse } from './pseudo-inverse.internal';
import type { IterationOptions, MatLike } from './types';

/**
 * rectangular matrix `A`(`m x n`)의 SVD 2-norm condition number를 계산한다.
 *
 * 정의: `kappa_2(A) = sigma_max / sigma_min`. full-rank가 아니면 `Number.POSITIVE_INFINITY`.
 *
 * - 빈 matrix `[]`(`shape = [0, 0]`)는 vacuous identity 경계로 `1`을 반환한다.
 * - thin SVD `rank < min(rows, columns)`이면 zero singular value가 존재하므로 `Infinity`.
 * - 그 외에는 `singularValues[0] / singularValues[rank - 1]`를 반환한다. ratio가 non-finite인데
 *   rank-deficient 분기와 맞지 않으면 `RangeError`.
 *
 * 검증 순서: `resolveIterationOptions` → `extractMatrixShape(matrix)` → `assertFiniteMatrixEntries`
 * → SVD 계산 → 분기. 빈 matrix `[]` fast path는 SVD 호출 후 `m === 0 && n === 0` 분기에서 처리한다.
 * Jacobi convergence 실패와 음수 eigenvalue 같은 numeric failure는 `undefined`.
 *
 * `matrix`는 rectangular nested array여야 한다. ragged matrix와 one-sided zero shape `[[]]`는
 * `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.maxIterations`는 positive safe integer, `options.tolerance`와 `options.epsilon`은 0 이상
 * finite number여야 한다. 위반 시 `RangeError`. `tolerance`는 Jacobi off-diagonal convergence 판정에
 * 사용한다. `epsilon`은 SVD eigenvalue clamp / sigma rank 판정에만 사용하며 input/result finite
 * validation에는 사용하지 않는다.
 *
 * 반환 값에서 `Infinity`는 정의된 결과(singular / rank-deficient)이며 validation 오류와 구분된다.
 *
 * @param matrix condition number를 계산할 source matrix
 * @param options 반복 옵션. 미지정 시 default(`maxIterations=100`, `tolerance=1e-10`, `epsilon=1e-9`).
 */
export function conditionNumber(matrix: MatLike, options?: IterationOptions): number | undefined {
  const context = prepareSvdForPseudoInverse(matrix, options);
  if (context === undefined) {
    return undefined;
  }
  const { shape, svd } = context;
  const [m, n] = shape;
  // extractMatrixShape이 one-sided zero shape를 RangeError로 reject하므로 도달 시 m === 0 ↔ n === 0이 보장된다.
  if (m === 0 && n === 0) {
    return 1;
  }
  const minDim = m < n ? m : n;
  if (svd.rank < minDim) {
    return Number.POSITIVE_INFINITY;
  }
  const largest = svd.singularValues[0];
  const smallest = svd.singularValues[svd.rank - 1];
  const ratio = largest / smallest;
  if (!Number.isFinite(ratio)) {
    throw new RangeError(
      `conditionNumber ratio produced non-finite value, got ${String(ratio)} (largest=${String(largest)}, smallest=${String(smallest)})`
    );
  }
  return ratio;
}
