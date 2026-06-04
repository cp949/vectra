import { resolveIterationOptions } from './jacobi-eigen.internal';
import { computeThinSingularValueDecomposition } from './svd.internal';
import type { IterationOptions, MatLike, SingularValueDecomposition } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * rectangular matrix `A`(`m x n`)의 thin SVD `A = U * diag(singularValues) * V^T`를 계산한다.
 *
 * 검증 순서: `resolveIterationOptions` → `extractMatrixShape(matrix)` → `assertFiniteMatrixEntries`.
 * 어느 단계 실패도 결과 미생성이다.
 *
 * 알고리즘과 결과 정책은 `computeThinSingularValueDecomposition` internal core가 정의한다.
 * 본 leaf는 검증과 internal core 호출을 묶는 facade다(`columnSpaceInto`와 같은 internal core를
 * 공유한다).
 *
 * `matrix`는 rectangular nested array여야 한다. ragged matrix와 one-sided zero shape `[[]]`는
 * `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.maxIterations`는 positive safe integer, `options.tolerance`와 `options.epsilon`은 0 이상
 * finite number여야 한다. 위반 시 `RangeError`. options 검증은 다른 input 검증보다 먼저 수행한다.
 *
 * `tolerance`는 Jacobi off-diagonal convergence 판정에만 사용한다. `epsilon`은 negative eigenvalue
 * clamp 경계, sigma rank 판정, vector zero cleanup에만 사용한다. input/result finite validation에는
 * 둘 다 사용하지 않는다.
 *
 * thin SVD 결과 shape: `leftSingularVectors`는 `m x rank`, `rightSingularVectors`는 `n x rank`,
 * `singularValues.length === rank`. `rank === 0`이면 세 collection 모두 `[]`이다.
 *
 * 결과는 fixed plain object를 직접 반환한다(`*Into` variant를 제공하지 않는다).
 *
 * @param matrix rectangular finite numeric matrix
 * @param options 반복 옵션. 미지정 시 default(`maxIterations=100`, `tolerance=1e-10`, `epsilon=1e-9`).
 */
export function singularValueDecomposition(
  matrix: MatLike,
  options?: IterationOptions
): SingularValueDecomposition | undefined {
  const resolved = resolveIterationOptions(options, 'options');
  const shape = extractMatrixShape(matrix, 'matrix');
  assertFiniteMatrixEntries(matrix, shape, 'matrix');
  return computeThinSingularValueDecomposition(matrix, shape, resolved);
}
