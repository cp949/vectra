import { solveLeastSquares } from './least-squares.internal';
import type { LeastSquaresOptions, LeastSquaresResult } from './types';

/**
 * overdetermined 또는 square linear system `A * x = b`의 least-squares solution을 반환한다.
 *
 * 검증 순서: `options.epsilon` → `A` shape → `b` array/length → `rowCount >= columnCount` →
 * `A`/`b` finite entry. 어느 단계 실패도 결과 미생성이다.
 *
 * 알고리즘: modified Gram-Schmidt thin QR로 `A = Q * R`을 만든 뒤 `Q^T * b`와 `R * x = y`
 * back-substitution으로 coefficient vector를 구한다. residual은 `||A * x - b||₂`를 max-scaling으로
 * 계산해 overflow를 회피한다.
 *
 * full column rank이면 `{ coefficients, residual, rank }`를 반환한다. rank-deficient(어느 column의
 * orthogonalized norm이 `epsilon` 이하)이면 `undefined`. 결과 coefficient의 `-0`은 `+0`으로
 * canonicalize한다. residual은 비음의 finite number다.
 *
 * `A`는 rectangular nested array여야 한다. ragged matrix는 `RangeError`. top-level 또는 row가 array가
 * 아니면 `TypeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`. `b.length`는 `A`의
 * row 수와 같아야 한다. 위반 시 `RangeError`. `b`의 모든 entry는 finite number여야 한다. 위반 시
 * `RangeError`. `A.rows < A.columns`는 overdetermined solver 범위 밖으로 `RangeError`.
 * `options.epsilon`은 0 이상 finite number여야 한다. 미지정 시 default(`1e-9`). 위반 시 `RangeError`.
 * `epsilon` 검증은 다른 input 검증보다 먼저 수행한다.
 * `epsilon`은 rank-deficient 판정에만 쓰인다. input/result finite validation과 residual 계산에는
 * 사용하지 않는다.
 *
 * `A`가 `m x 0` shape(`m >= 0`)이고 `b.length === m`이면 coefficients는 `[]`, residual은 `||b||₂`,
 * rank는 `0`이다. `A = []`, `b = []`는 그 sub-case(`m = 0`)로 `{ coefficients: [], residual: 0, rank: 0 }`
 * 을 반환한다.
 *
 * QR/back-substitution/residual 단계의 누적 sum, projection, division, 곱셈 결과 중 하나라도
 * non-finite면 `RangeError`.
 *
 * 결과는 fixed plain object를 직접 반환한다. `*Into` variant를 제공하지 않는다.
 *
 * @param A 계수 matrix. row-major rectangular finite number matrix.
 * @param b 우변 vector. `A`의 row 수와 같은 길이의 finite number 배열.
 * @param options 옵션. `epsilon` 미지정 시 default(`1e-9`).
 */
export function solveOverdeterminedSystem(
  A: readonly (readonly number[])[],
  b: readonly number[],
  options?: LeastSquaresOptions
): LeastSquaresResult | undefined {
  return solveLeastSquares(A, b, options, 'A', 'b');
}
