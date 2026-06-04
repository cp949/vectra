import { augmentInto } from './augment-into';
import type { MatLike } from './types';

/**
 * 두 matrix를 옆으로 augment한 `[left | right]` 결과를 새 `number[][]`로 반환한다.
 *
 * `left`와 `right`는 row count가 같아야 한다. column 수는 각각 다를 수 있다.
 * `augment([], [])`는 빈 배열 `[]`을 반환한다.
 * 한쪽만 empty인 경우 nested array로 one-sided zero shape를 표현할 수 없어 row count
 * mismatch로 `RangeError`.
 * `left`와 `right`는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * 결과는 input row 참조를 공유하지 않는 새 nested array다.
 *
 * @param left augment의 왼쪽 matrix
 * @param right augment의 오른쪽 matrix. `left`와 같은 row count여야 한다.
 */
export function augment(left: MatLike, right: MatLike): number[][] {
  const rows = left.length;
  const leftFirst = left[0];
  const rightFirst = right[0];
  const leftColumns = Array.isArray(leftFirst) ? leftFirst.length : 0;
  const rightColumns = Array.isArray(rightFirst) ? rightFirst.length : 0;
  const columns = leftColumns + rightColumns;
  const out: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    out[r] = new Array(columns);
  }
  return augmentInto(out, left, right);
}
