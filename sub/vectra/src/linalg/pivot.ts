import { pivotInto } from './pivot-into';
import type { MatLike, PivotOptions } from './types';

/**
 * `matrix`에 partial pivoting row reordering을 적용한 결과를 새 `number[][]`로 반환한다.
 *
 * `min(rows, columns)`개의 diagonal에 대해, 각 diagonal `i`에서 column `i`를 보고 `r >= i`인
 * 행 중 `Math.abs(matrix[r][i])`가 최대인 row와 row `i`를 swap한다. 최대 절대값이
 * `options.epsilon` 이하이면 해당 diagonal에서는 swap하지 않는다. 결과는 row 순서만 변한
 * matrix이며 entry 값은 변하지 않는다(elimination을 수행하지 않는다).
 *
 * `matrix`는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.epsilon`은 0 이상 finite number여야 한다. 미지정 시 default(`1e-9`). 위반 시
 * `RangeError`.
 * 빈 matrix `[]`는 빈 배열 `[]`을 반환한다.
 * 결과는 input row 참조를 공유하지 않는 새 nested array다.
 *
 * @param matrix partial pivoting을 적용할 source matrix
 * @param options pivot 옵션. `epsilon` 미지정 시 default(`1e-9`).
 */
export function pivot(matrix: MatLike, options?: PivotOptions): number[][] {
  const rows = matrix.length;
  const firstRow = matrix[0];
  const columns = Array.isArray(firstRow) ? firstRow.length : 0;
  const out: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    out[r] = new Array(columns);
  }
  return pivotInto(out, matrix, options);
}
