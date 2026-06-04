import { reducedRowEchelonForm } from './reduced-row-echelon-form';
import type { MatLike, PivotOptions } from './types';

/**
 * `matrix`의 Gauss-Jordan elimination 결과를 새 `number[][]`로 반환한다.
 *
 * `reducedRowEchelonForm`의 canonical alias다. 같은 partial pivoting RREF 결과를 반환하며
 * pivot row normalize, pivot column 위/아래 entry 제거, epsilon zero cleanup 정책을 모두
 * 동일하게 따른다.
 *
 * `matrix`는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.epsilon`은 0 이상 finite number여야 한다. 미지정 시 default(`1e-9`). 위반 시
 * `RangeError`.
 * elimination 도중 결과 entry가 finite number가 아니면 `RangeError`.
 * 빈 matrix `[]`는 빈 배열 `[]`을 반환한다.
 * 결과는 input row 참조를 공유하지 않는 새 nested array다.
 *
 * @param matrix Gauss-Jordan elimination을 적용할 source matrix
 * @param options pivot 옵션. `epsilon` 미지정 시 default(`1e-9`).
 */
export function gaussJordan(matrix: MatLike, options?: PivotOptions): number[][] {
  return reducedRowEchelonForm(matrix, options);
}
