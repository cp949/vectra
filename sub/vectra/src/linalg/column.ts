import { columnInto } from './column-into';
import type { MatLike } from './types';

/**
 * matrix의 `columnIndex`번째 column을 복사해 새 `number[]`로 반환한다.
 *
 * matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `columnIndex`는 `Number.isInteger`이고 `0 <= columnIndex < columns`여야 한다. 위반 시 `RangeError`.
 *
 * @param matrix column을 읽을 matrix
 * @param columnIndex 읽을 column의 0-based index. 비음의 safe integer.
 */
export function column(matrix: MatLike, columnIndex: number): number[] {
  const out: number[] = new Array(matrix.length);
  return columnInto(out, matrix, columnIndex);
}
