import type { MatLike, MatrixShape } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * matrix의 `[rows, columns]` shape를 새 tuple로 반환한다.
 *
 * matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 빈 matrix `[]`는 `[0, 0]`로 취급한다. `[[]]`처럼 one-sided zero shape는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 *
 * @param matrix shape를 얻을 matrix
 */
export function shape(matrix: MatLike): MatrixShape {
  const [rows, columns] = extractMatrixShape(matrix, 'matrix');
  assertFiniteMatrixEntries(matrix, [rows, columns], 'matrix');
  return [rows, columns];
}
