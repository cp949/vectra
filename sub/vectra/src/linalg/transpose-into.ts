import { assertMatrixOutCapacity } from './matrix-out-capacity.internal';
import type { MatLike, MatWritable } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * matrix를 transpose한 결과를 `out`에 기록한다.
 *
 * matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `out`은 target shape `[columns, rows]`에 맞는 row와 column capacity가 준비되어 있어야 한다.
 * row 개수가 columns보다 적거나, row가 array가 아니거나, row capacity가 rows보다 작으면 `RangeError`.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다(모든 validation 성공 후에만 mutate).
 * 성공 시 `out`은 `[columns, rows]` shape의 matrix가 되고, 각 row length는 rows로 `out.length`는 columns로 truncate된다.
 * 빈 matrix `[]`(`shape = [0, 0]`)는 `out.length = 0`만 설정한다.
 *
 * aliasing은 허용하지 않는다. `out === matrix`이면 `RangeError`.
 *
 * @param out transpose 결과를 기록할 writable matrix. target shape `[columns, rows]`에 맞는 capacity가 준비되어 있어야 한다.
 * @param matrix transpose할 matrix
 */
export function transposeInto<Out extends MatWritable>(out: Out, matrix: MatLike): Out {
  // aliasing은 in-place transpose가 non-square에서 정의되지 않으므로 reject한다.
  if ((out as unknown) === matrix) {
    throw new RangeError('transposeInto does not support aliasing: out and matrix must be different references');
  }
  const [rows, columns] = extractMatrixShape(matrix, 'matrix');
  assertFiniteMatrixEntries(matrix, [rows, columns], 'matrix');
  assertMatrixOutCapacity(out, columns, rows, 'out');
  for (let c = 0; c < columns; c++) {
    const outRow = out[c];
    for (let r = 0; r < rows; r++) {
      outRow[r] = matrix[r][c];
    }
    outRow.length = rows;
  }
  out.length = columns;
  return out;
}
