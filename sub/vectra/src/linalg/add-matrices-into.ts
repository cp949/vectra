import { commitMatrixInto } from './commit-matrix.internal';
import type { MatLike, MatWritable } from './types';
import { assertFiniteMatrixEntries, assertSameMatrixShape, extractMatrixShape } from './validate.internal';

/**
 * 두 matrix의 element-wise 합 `out[r][c] = a[r][c] + b[r][c]`를 `out`에 기록한다.
 *
 * 두 matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 두 matrix의 shape가 다르면 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * 모든 element 합이 finite number여야 한다. 위반 시 `RangeError`.
 * `out`은 target shape에 맞는 row와 column capacity가 준비되어 있어야 한다. 부족하면 `RangeError`.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다(temp matrix에서 계산을 완성한 뒤 commit).
 * 성공 시 `out.length`는 `rows`로, 각 row length는 `columns`로 truncate된다.
 * 빈 matrix `[]`(`shape = [0, 0]`)는 `out.length = 0`만 설정한다.
 *
 * `out === a` 또는 `out === b` aliasing을 허용한다. temp matrix에서 결과를 만든 뒤 commit한다.
 *
 * @param out 합을 기록할 writable matrix. target shape에 맞는 capacity가 준비되어 있어야 한다.
 * @param a element-wise 합의 첫 번째 matrix
 * @param b element-wise 합의 두 번째 matrix. `a`와 같은 shape여야 한다.
 */
export function addMatricesInto<Out extends MatWritable>(out: Out, a: MatLike, b: MatLike): Out {
  const shapeA = extractMatrixShape(a, 'a');
  const shapeB = extractMatrixShape(b, 'b');
  assertSameMatrixShape(shapeA, shapeB, 'a', 'b');
  assertFiniteMatrixEntries(a, shapeA, 'a');
  assertFiniteMatrixEntries(b, shapeB, 'b');
  const [rows, columns] = shapeA;
  const temp: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    const rowA = a[r];
    const rowB = b[r];
    const tempRow = new Array<number>(columns);
    for (let c = 0; c < columns; c++) {
      const value = rowA[c] + rowB[c];
      if (!Number.isFinite(value)) {
        throw new RangeError(`a[${r}][${c}] + b[${r}][${c}] must be a finite number, got ${String(value)}`);
      }
      tempRow[c] = value;
    }
    temp[r] = tempRow;
  }
  commitMatrixInto(out, temp, rows, columns, 'out');
  return out;
}
