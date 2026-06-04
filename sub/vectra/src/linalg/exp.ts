import { expInto } from './exp-into';
import type { MatLike, MatrixExponentialOptions } from './types';

/**
 * square matrix의 matrix exponential `e^matrix`를 새 `number[][]`로 반환한다.
 *
 * scaling-and-squaring + Taylor series로 계산한다. 먼저 infinity norm 기반으로
 * `s = max(0, ceil(log2(norm / scalingThreshold)))`를 정해 `B = matrix / 2^s`를 만들고,
 * Taylor recurrence `term_k = term_{k-1} * B / k`로 `I + B + B^2/2! + ...`를 누적한다.
 * `||term_k||_inf <= tolerance`이면 수렴으로 본다. 그 다음 결과를 `s`번 제곱한다.
 *
 * `matrix`는 square rectangular nested array여야 한다. `rows !== columns`이면 `RangeError`.
 * ragged matrix 또는 non-finite entry는 `RangeError`.
 * `options.maxTerms`는 positive safe integer여야 한다. 위반 시 `RangeError`. 기본 `64`.
 * `options.tolerance`는 0 이상 finite number여야 한다. 위반 시 `RangeError`. 기본 `1e-12`.
 * `options.scalingThreshold`는 positive finite number여야 한다. 위반 시 `RangeError`. 기본 `0.5`.
 * `maxTerms` 안에 수렴하지 않으면 `RangeError`. 중간 term/누적/제곱 결과 entry가 non-finite가
 * 되는 즉시 `RangeError`.
 * 빈 matrix `[]`는 `[]`을 반환한다.
 * 결과는 input row 참조를 공유하지 않는 새 nested array다. 결과 entry에는 `-0`이 남지 않는다.
 *
 * @param matrix matrix exponential을 계산할 square matrix
 * @param options scaling, Taylor convergence 옵션. 미지정 시 default(maxTerms=64, tolerance=1e-12, scalingThreshold=0.5).
 */
export function exp(matrix: MatLike, options?: MatrixExponentialOptions): number[][] {
  const n = matrix.length;
  const out: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    out[r] = new Array<number>(n);
  }
  return expInto(out, matrix, options);
}
