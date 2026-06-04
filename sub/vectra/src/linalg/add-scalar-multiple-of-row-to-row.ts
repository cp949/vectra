import { addScalarMultipleOfRowToRowInto } from './add-scalar-multiple-of-row-to-row-into';
import type { MatLike } from './types';

/**
 * `matrix`의 `targetRow`에 `scalar * rowToAdd`를 더한 결과를 새 `number[][]`로 반환한다.
 *
 * `targetRow !== r`인 row는 그대로 복사한다. `targetRow` row의 각 entry는 같은 column index의
 * `rowToAdd` entry에 `scalar`를 곱해 더한다.
 * `targetRow === rowToAdd`이면 해당 row를 `(1 + scalar)`배로 만든다(self-add 허용).
 * `matrix`는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `targetRow`, `rowToAdd`는 `0 <= index < rows`인 정수여야 한다. NaN, Infinity, 비정수, 음수,
 * 범위 초과는 `RangeError`.
 * `scalar`는 finite number여야 한다. 위반 시 `RangeError`. `scalar = 0`은 허용하며 `targetRow`를
 * 그대로 둔다.
 * 곱 또는 합 결과가 finite number가 아니면 `RangeError`.
 * 결과는 input row 참조를 공유하지 않는 새 nested array다.
 *
 * @param matrix row 합을 적용할 source matrix
 * @param targetRow 합을 누적할 row index. 0-based 정수.
 * @param rowToAdd scaling 후 더할 source row index. 0-based 정수.
 * @param scalar `rowToAdd` 각 entry에 곱할 finite scalar
 */
export function addScalarMultipleOfRowToRow(
  matrix: MatLike,
  targetRow: number,
  rowToAdd: number,
  scalar: number
): number[][] {
  const rows = matrix.length;
  const firstRow = matrix[0];
  const columns = Array.isArray(firstRow) ? firstRow.length : 0;
  const out: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    out[r] = new Array(columns);
  }
  return addScalarMultipleOfRowToRowInto(out, matrix, targetRow, rowToAdd, scalar);
}
