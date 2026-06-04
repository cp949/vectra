import type { MatLike, VecWritable } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * matrix의 `rowIndex`번째 row를 복사해 `out`에 기록한다.
 *
 * matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `rowIndex`는 `Number.isInteger`이고 `0 <= rowIndex < rows`여야 한다. 위반 시 `RangeError`.
 * `out.length`가 columns보다 작으면 `RangeError`를 던지고 `out`은 수정하지 않는다.
 * 성공 시 `out[0..columns)`에 row 값을 기록하고 `out.length`는 columns로 truncate된다.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다(모든 validation 성공 후에만 mutate).
 *
 * @param out row를 기록할 writable vector. capacity가 columns 이상이어야 한다.
 * @param matrix row를 읽을 matrix
 * @param rowIndex 읽을 row의 0-based index. 비음의 safe integer.
 */
export function rowInto<Out extends VecWritable>(out: Out, matrix: MatLike, rowIndex: number): Out {
  const [rows, columns] = extractMatrixShape(matrix, 'matrix');
  assertFiniteMatrixEntries(matrix, [rows, columns], 'matrix');
  if (!Number.isInteger(rowIndex) || rowIndex < 0 || rowIndex >= rows) {
    throw new RangeError(`rowIndex must be an integer in [0, ${rows}), got ${String(rowIndex)}`);
  }
  if (out.length < columns) {
    throw new RangeError(`out capacity (${out.length}) is less than columns (${columns})`);
  }
  const row = matrix[rowIndex];
  for (let c = 0; c < columns; c++) {
    out[c] = row[c];
  }
  out.length = columns;
  return out;
}
