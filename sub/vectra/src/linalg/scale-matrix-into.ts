import { commitMatrixInto } from './commit-matrix.internal';
import type { MatLike, MatWritable } from './types';
import { assertFiniteMatrixEntries, assertFiniteNumber, extractMatrixShape } from './validate.internal';

/**
 * matrix를 scalar로 곱한 결과 `out[r][c] = matrix[r][c] * scalar`를 `out`에 기록한다.
 *
 * matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `scalar`는 finite number여야 한다. 위반 시 `RangeError`.
 * 모든 element 곱이 finite number여야 한다. 위반 시 `RangeError`.
 * `out`은 matrix와 같은 shape에 맞는 row와 column capacity가 준비되어 있어야 한다. 부족하면 `RangeError`.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다(temp matrix에서 계산을 완성한 뒤 commit).
 * 성공 시 `out.length`는 `rows`로, 각 row length는 `columns`로 truncate된다.
 * 빈 matrix `[]`(`shape = [0, 0]`)는 `out.length = 0`만 설정한다.
 *
 * `out === matrix` aliasing을 허용한다. temp matrix에서 결과를 만든 뒤 commit한다.
 *
 * @param out scale 결과를 기록할 writable matrix. matrix와 같은 shape에 맞는 capacity가 준비되어 있어야 한다.
 * @param matrix scale할 matrix
 * @param scalar 모든 entry에 곱할 finite scalar
 */
export function scaleMatrixInto<Out extends MatWritable>(out: Out, matrix: MatLike, scalar: number): Out {
  assertFiniteNumber(scalar, 'scalar');
  const shape = extractMatrixShape(matrix, 'matrix');
  assertFiniteMatrixEntries(matrix, shape, 'matrix');
  const [rows, columns] = shape;
  const temp: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    const row = matrix[r];
    const tempRow = new Array<number>(columns);
    for (let c = 0; c < columns; c++) {
      const value = row[c] * scalar;
      if (!Number.isFinite(value)) {
        throw new RangeError(`matrix[${r}][${c}] * scalar must be a finite number, got ${String(value)}`);
      }
      tempRow[c] = value;
    }
    temp[r] = tempRow;
  }
  commitMatrixInto(out, temp, rows, columns, 'out');
  return out;
}
