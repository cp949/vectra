import { multiplyRowByScalarInto } from './multiply-row-by-scalar-into';
import type { MatLike } from './types';

/**
 * `matrix`의 `rowIndex`번째 row를 `scalar`로 곱한 결과를 새 `number[][]`로 반환한다.
 *
 * `rowIndex !== r`인 row는 그대로 복사한다. `rowIndex` row의 각 entry는 `scalar`로 곱한다.
 * `matrix`는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `rowIndex`는 `0 <= rowIndex < rows`인 정수여야 한다. NaN, Infinity, 비정수, 음수, 범위 초과는
 * `RangeError`.
 * `scalar`는 finite number여야 한다. 위반 시 `RangeError`. `scalar = 0`은 허용하며 해당 row를
 * zero row로 만든다.
 * 곱 결과가 finite number가 아니면 `RangeError`.
 * 결과는 input row 참조를 공유하지 않는 새 nested array다.
 *
 * @param matrix scale할 source matrix
 * @param rowIndex scale할 row index. 0-based 정수.
 * @param scalar 해당 row의 모든 entry에 곱할 finite scalar
 */
export function multiplyRowByScalar(matrix: MatLike, rowIndex: number, scalar: number): number[][] {
  const rows = matrix.length;
  const firstRow = matrix[0];
  const columns = Array.isArray(firstRow) ? firstRow.length : 0;
  const out: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    out[r] = new Array(columns);
  }
  return multiplyRowByScalarInto(out, matrix, rowIndex, scalar);
}
