import { commitMatrixInto } from './commit-matrix.internal';
import type { MatLike, MatWritable } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * 두 matrix를 옆으로 augment한 `[left | right]` 결과를 `out`에 기록한다.
 *
 * `left`와 `right`는 row count가 같아야 한다. column 수는 각각 다를 수 있다.
 * `augment([], [])`는 `[0, 0]` 빈 결과로 `out.length = 0`만 설정한다.
 * 한쪽만 empty인 경우 nested array로 one-sided zero shape를 표현할 수 없어 row count
 * mismatch로 `RangeError`.
 * `left`와 `right`는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `out`은 `[rows, leftColumns + rightColumns]` shape에 맞는 row와 column capacity가 준비되어
 * 있어야 한다. 부족하면 `RangeError`.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다(temp matrix에서 계산을
 * 완성한 뒤 commit).
 * 성공 시 `out.length`는 `rows`로, 각 row length는 `leftColumns + rightColumns`로 truncate된다.
 *
 * `out === left` 또는 `out === right` aliasing을 허용한다. temp matrix에서 결과를 만든 뒤
 * commit한다.
 *
 * @param out augment 결과를 기록할 writable matrix. `[rows, leftColumns + rightColumns]`에 맞는
 *            capacity가 준비되어 있어야 한다.
 * @param left augment의 왼쪽 matrix
 * @param right augment의 오른쪽 matrix. `left`와 같은 row count여야 한다.
 */
export function augmentInto<Out extends MatWritable>(out: Out, left: MatLike, right: MatLike): Out {
  const leftShape = extractMatrixShape(left, 'left');
  const rightShape = extractMatrixShape(right, 'right');
  if (leftShape[0] !== rightShape[0]) {
    throw new RangeError(`left row count (${leftShape[0]}) must equal right row count (${rightShape[0]})`);
  }
  assertFiniteMatrixEntries(left, leftShape, 'left');
  assertFiniteMatrixEntries(right, rightShape, 'right');
  const rows = leftShape[0];
  const leftColumns = leftShape[1];
  const rightColumns = rightShape[1];
  const columns = leftColumns + rightColumns;
  const temp: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    const tempRow = new Array<number>(columns);
    const leftRow = left[r];
    const rightRow = right[r];
    for (let c = 0; c < leftColumns; c++) {
      tempRow[c] = leftRow[c];
    }
    for (let c = 0; c < rightColumns; c++) {
      tempRow[leftColumns + c] = rightRow[c];
    }
    temp[r] = tempRow;
  }
  commitMatrixInto(out, temp, rows, columns, 'out');
  return out;
}
