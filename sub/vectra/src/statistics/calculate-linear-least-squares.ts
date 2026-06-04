import { solveLeastSquares } from './least-squares.internal';
import type { LeastSquaresOptions, LeastSquaresResult } from './types';

/**
 * design matrix `data`와 target vector `template`의 least-squares fit을 반환한다.
 *
 * `data`는 row-major design matrix(`m x n`, `m >= n`)이고 `template`은 row 수와 같은 length의 target
 * vector다. column별 coefficient를 구해 `template ≈ data * coefficients`가 되도록 한다.
 *
 * 동작·검증·실패 정책은 `solveOverdeterminedSystem`과 동일하며 인자명만 `data`/`template`으로
 * statistics-facing alias를 제공한다.
 *
 * 검증 순서: `options.epsilon` → `data` shape → `template` array/length → `rowCount >= columnCount` →
 * `data`/`template` finite entry. 어느 단계 실패도 결과 미생성이다.
 *
 * full column rank이면 `{ coefficients, residual, rank }`를 반환한다. rank-deficient(QR 단계에서 어느
 * column의 orthogonalized norm이 `epsilon` 이하)이면 `undefined`. 결과 coefficient의 `-0`은 `+0`으로
 * canonicalize한다. residual은 비음의 finite number다.
 *
 * `data`는 rectangular nested array여야 한다. ragged matrix는 `RangeError`. top-level 또는 row가 array가
 * 아니면 `TypeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`. `template.length`는
 * `data`의 row 수와 같아야 한다. 위반 시 `RangeError`. `template`의 모든 entry는 finite number여야 한다.
 * 위반 시 `RangeError`. `data.rows < data.columns`는 overdetermined solver 범위 밖으로 `RangeError`.
 * `options.epsilon`은 0 이상 finite number여야 한다. 미지정 시 default(`1e-9`). 위반 시 `RangeError`.
 * `epsilon` 검증은 다른 input 검증보다 먼저 수행한다.
 * `epsilon`은 QR rank-deficient 판정에만 쓰인다. input/result finite validation과 residual 계산에는
 * 사용하지 않는다.
 *
 * `data`가 `m x 0` shape(`m >= 0`)이고 `template.length === m`이면 coefficients는 `[]`, residual은
 * `||template||₂`, rank는 `0`이다. `data = []`, `template = []`는 그 sub-case(`m = 0`)로
 * `{ coefficients: [], residual: 0, rank: 0 }`을 반환한다.
 *
 * QR/back-substitution/residual 단계의 누적 sum, projection, division, 곱셈 결과 중 하나라도
 * non-finite면 `RangeError`.
 *
 * 결과는 fixed plain object를 직접 반환한다. `*Into` variant를 제공하지 않는다.
 *
 * @param data design matrix. row-major rectangular finite number matrix.
 * @param template target vector. `data`의 row 수와 같은 길이의 finite number 배열.
 * @param options 옵션. `epsilon` 미지정 시 default(`1e-9`).
 */
export function calculateLinearLeastSquares(
  data: readonly (readonly number[])[],
  template: readonly number[],
  options?: LeastSquaresOptions
): LeastSquaresResult | undefined {
  return solveLeastSquares(data, template, options, 'data', 'template');
}
