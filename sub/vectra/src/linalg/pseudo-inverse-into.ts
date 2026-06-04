import { commitMatrixInto } from './commit-matrix.internal';
import { buildPseudoInverseFromSvd, prepareSvdForPseudoInverse } from './pseudo-inverse.internal';
import type { IterationOptions, MatLike, MatWritable } from './types';

/**
 * rectangular matrix `A`(`m x n`)의 Moore-Penrose pseudo-inverse `A^+`(`n x m`)를 `out`에 기록한다.
 *
 * thin SVD `A = U * diag(sigma) * V^T`로부터 `A^+ = V * diag(1/sigma) * U^T`를 계산한다.
 * `rank === 0`이면 zero matrix `n x m`을 기록하고, 빈 matrix `[]`(`shape = [0, 0]`)는
 * `out.length = 0`만 설정한다.
 *
 * 검증 순서: `resolveIterationOptions` → `extractMatrixShape(matrix)` → `assertFiniteMatrixEntries`
 * → SVD 계산 → pseudo-inverse temp 계산 → `out` capacity 검증 → commit. 어느 단계 실패도
 * `out`을 호출 전 상태 그대로 둔다.
 *
 * `matrix`는 rectangular nested array여야 한다. ragged matrix와 one-sided zero shape `[[]]`는
 * `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.maxIterations`는 positive safe integer, `options.tolerance`와 `options.epsilon`은 0 이상
 * finite number여야 한다. 위반 시 `RangeError`. `tolerance`는 Jacobi off-diagonal convergence 판정에
 * 사용한다. `epsilon`은 SVD eigenvalue clamp / sigma rank 판정 / pseudo-inverse zero cleanup에만
 * 사용하며 input/result finite validation에는 사용하지 않는다.
 *
 * Jacobi convergence 실패와 음수 eigenvalue 같은 numeric failure는 `undefined`를 반환하고 `out`은
 * 수정되지 않는다. pseudo-inverse 누적 합/division 결과가 non-finite면 `RangeError`.
 *
 * `out`은 `n` row capacity와 각 row에 `m` column capacity가 준비되어 있어야 한다. 부족하면
 * `RangeError`를 던지고 `out`은 수정하지 않는다. 성공 시 `out.length`는 `n`, 각 row length는 `m`으로
 * truncate된다. 결과 entry에는 `-0`이 남지 않는다.
 *
 * `out === matrix` aliasing은 temp matrix를 거치므로 안전하다.
 *
 * @param out pseudo-inverse를 기록할 writable matrix. 실패 또는 `undefined` 반환 시 수정되지 않는다.
 * @param matrix pseudo-inverse를 계산할 source matrix
 * @param options 반복 옵션. 미지정 시 default(`maxIterations=100`, `tolerance=1e-10`, `epsilon=1e-9`).
 */
export function pseudoInverseInto<Out extends MatWritable>(
  out: Out,
  matrix: MatLike,
  options?: IterationOptions
): Out | undefined {
  const context = prepareSvdForPseudoInverse(matrix, options);
  if (context === undefined) {
    return undefined;
  }
  const { shape, resolved, svd } = context;
  const [m, n] = shape;
  // extractMatrixShape이 one-sided zero shape를 RangeError로 reject하므로 도달 시 m === 0 ↔ n === 0이 보장된다.
  if (m === 0 && n === 0) {
    out.length = 0;
    return out;
  }
  const temp = buildPseudoInverseFromSvd(svd, m, n, resolved.epsilon);
  commitMatrixInto(out, temp, n, m, 'out');
  return out;
}
