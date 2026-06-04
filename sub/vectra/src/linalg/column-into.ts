import type { MatLike, VecWritable } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * matrix의 `columnIndex`번째 column을 복사해 `out`에 기록한다.
 *
 * matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `columnIndex`는 `Number.isInteger`이고 `0 <= columnIndex < columns`여야 한다. 위반 시 `RangeError`.
 * `out.length`가 rows보다 작으면 `RangeError`를 던지고 `out`은 수정하지 않는다.
 * 성공 시 `out[0..rows)`에 column 값을 기록하고 `out.length`는 rows로 truncate된다.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다(모든 validation 성공 후에만 mutate).
 *
 * @param out column을 기록할 writable vector. capacity가 rows 이상이어야 한다.
 * @param matrix column을 읽을 matrix
 * @param columnIndex 읽을 column의 0-based index. 비음의 safe integer.
 */
export function columnInto<Out extends VecWritable>(out: Out, matrix: MatLike, columnIndex: number): Out {
  const [rows, columns] = extractMatrixShape(matrix, 'matrix');
  assertFiniteMatrixEntries(matrix, [rows, columns], 'matrix');
  if (!Number.isInteger(columnIndex) || columnIndex < 0 || columnIndex >= columns) {
    throw new RangeError(`columnIndex must be an integer in [0, ${columns}), got ${String(columnIndex)}`);
  }
  if (out.length < rows) {
    throw new RangeError(`out capacity (${out.length}) is less than rows (${rows})`);
  }
  for (let r = 0; r < rows; r++) {
    out[r] = matrix[r][columnIndex];
  }
  out.length = rows;
  return out;
}
