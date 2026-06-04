import { commitMatrixInto } from './commit-matrix.internal';
import type { MatLike, MatWritable } from './types';
import { assertFiniteMatrixEntries, assertRowIndex, extractMatrixShape } from './validate.internal';

/**
 * `matrix`의 `targetRow`에 `rowToAdd`를 더한 결과를 `out`에 기록한다.
 *
 * `targetRow !== r`인 row는 그대로 복사한다. `targetRow` row의 각 entry는 같은 column index의
 * `rowToAdd` entry를 더한다.
 * `targetRow === rowToAdd`이면 해당 row를 2배로 만든다(self-add 허용).
 * `matrix`는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `targetRow`, `rowToAdd`는 `0 <= index < rows`인 정수여야 한다. NaN, Infinity, 비정수, 음수,
 * 범위 초과는 `RangeError`.
 * 합 결과가 finite number가 아니면 `RangeError`.
 * `out`은 `matrix`와 같은 shape에 맞는 row와 column capacity가 준비되어 있어야 한다. 부족하면
 * `RangeError`.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다(temp matrix에서 계산을
 * 완성한 뒤 commit).
 *
 * `out === matrix` aliasing을 허용한다. temp matrix에서 결과를 만든 뒤 commit한다.
 *
 * @param out 결과를 기록할 writable matrix. `matrix`와 같은 shape에 맞는 capacity가 준비되어
 *            있어야 한다.
 * @param matrix row 합을 적용할 source matrix
 * @param targetRow 합을 누적할 row index. 0-based 정수.
 * @param rowToAdd `targetRow`에 더할 source row index. 0-based 정수.
 */
export function addRowToRowInto<Out extends MatWritable>(
  out: Out,
  matrix: MatLike,
  targetRow: number,
  rowToAdd: number
): Out {
  const shape = extractMatrixShape(matrix, 'matrix');
  assertFiniteMatrixEntries(matrix, shape, 'matrix');
  const [rows, columns] = shape;
  assertRowIndex(targetRow, rows, 'targetRow');
  assertRowIndex(rowToAdd, rows, 'rowToAdd');
  const temp: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    const src = matrix[r];
    const tempRow = new Array<number>(columns);
    if (r === targetRow) {
      const adder = matrix[rowToAdd];
      for (let c = 0; c < columns; c++) {
        const value = src[c] + adder[c];
        if (!Number.isFinite(value)) {
          throw new RangeError(
            `matrix[${targetRow}][${c}] + matrix[${rowToAdd}][${c}] must be a finite number, got ${String(value)}`
          );
        }
        tempRow[c] = value;
      }
    } else {
      for (let c = 0; c < columns; c++) {
        tempRow[c] = src[c];
      }
    }
    temp[r] = tempRow;
  }
  commitMatrixInto(out, temp, rows, columns, 'out');
  return out;
}
