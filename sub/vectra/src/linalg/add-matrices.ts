import { addMatricesInto } from './add-matrices-into';
import type { MatLike } from './types';

/**
 * 두 matrix의 element-wise 합 `[a[r][c] + b[r][c]]`을 새 `number[][]`로 반환한다.
 *
 * 두 matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 두 matrix의 shape가 다르면 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * 모든 element 합이 finite number여야 한다. 위반 시 `RangeError`.
 * 빈 matrix `[]`(`shape = [0, 0]`)는 빈 배열 `[]`을 반환한다.
 *
 * @param a element-wise 합의 첫 번째 matrix
 * @param b element-wise 합의 두 번째 matrix. `a`와 같은 shape여야 한다.
 */
export function addMatrices(a: MatLike, b: MatLike): number[][] {
  const rows = a.length;
  const firstRow = a[0];
  const columns = Array.isArray(firstRow) ? firstRow.length : 0;
  const out: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    out[r] = new Array(columns);
  }
  return addMatricesInto(out, a, b);
}
