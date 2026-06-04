import type { MatLike, SparseMatrixEntry, SparseOptions } from './types';
import { assertFiniteMatrixEntries, assertSparseEpsilon, extractMatrixShape } from './validate.internal';

/**
 * matrix의 `Math.abs(value) > epsilon`인 entry만 `{ row, column, value }` 형태로 `out`에 push한다.
 *
 * matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 빈 matrix `[]`는 shape `[0, 0]`로 취급한다. `[[]]`처럼 one-sided zero shape는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.epsilon`은 비음의 finite number여야 한다. 위반 시 `RangeError`.
 * `out`은 push 전에 `out.length = 0`으로 비워진다. 입력 validation 통과 후 비우기와 push가 시작되므로
 * validation 실패 시 `out`은 호출 전 상태 그대로 남는다.
 * entry는 row-major 순서(`row` 우선, 같은 row 안에서는 `column` 오름차순)로 push된다.
 *
 * @param out sparse entry를 기록할 writable array
 * @param matrix sparse 표현으로 추출할 matrix
 * @param options sparse 변환 옵션. `epsilon` 미지정 시 exact zero(`0`).
 */
export function matrixSparseEntriesInto(
  out: SparseMatrixEntry[],
  matrix: MatLike,
  options?: SparseOptions
): SparseMatrixEntry[] {
  const epsilon = options?.epsilon ?? 0;
  assertSparseEpsilon(epsilon);
  const shape = extractMatrixShape(matrix, 'matrix');
  assertFiniteMatrixEntries(matrix, shape, 'matrix');
  out.length = 0;
  const [rows, columns] = shape;
  for (let r = 0; r < rows; r++) {
    const row = matrix[r];
    for (let c = 0; c < columns; c++) {
      const value = row[c];
      if (Math.abs(value) > epsilon) {
        out.push({ row: r, column: c, value });
      }
    }
  }
  return out;
}
