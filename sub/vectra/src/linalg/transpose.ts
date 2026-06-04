import { transposeInto } from './transpose-into';
import type { MatLike } from './types';

/**
 * matrix를 transpose한 결과를 새 `number[][]`로 반환한다.
 *
 * matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * 빈 matrix `[]`는 빈 배열 `[]`을 반환한다.
 *
 * @param matrix transpose할 matrix
 */
export function transpose(matrix: MatLike): number[][] {
  const rows = matrix.length;
  const firstRow = matrix[0];
  const columns = Array.isArray(firstRow) ? firstRow.length : 0;
  const out: number[][] = new Array(columns);
  for (let c = 0; c < columns; c++) {
    out[c] = new Array(rows);
  }
  return transposeInto(out, matrix);
}
