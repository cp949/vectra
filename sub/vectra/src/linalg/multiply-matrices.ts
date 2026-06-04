import { multiplyMatricesInto } from './multiply-matrices-into';
import type { MatLike } from './types';

/**
 * 두 matrix의 곱 `[sum_k a[i][k] * b[k][j]]`을 새 `number[][]`로 반환한다.
 *
 * 두 matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * `a.columns`와 `b.rows`가 같지 않으면 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * 모든 출력 entry(`sum_k a[i][k] * b[k][j]`)가 finite number여야 한다. 위반 시 `RangeError`.
 * 빈 matrix `[]` × `[]`은 빈 배열 `[]`을 반환한다.
 *
 * @param a 곱셈 좌측 matrix
 * @param b 곱셈 우측 matrix. `a.columns`와 같은 row 개수를 가져야 한다.
 */
export function multiplyMatrices(a: MatLike, b: MatLike): number[][] {
  const aRows = a.length;
  const bFirstRow = b[0];
  const bColumns = Array.isArray(bFirstRow) ? bFirstRow.length : 0;
  const out: number[][] = new Array(aRows);
  for (let r = 0; r < aRows; r++) {
    out[r] = new Array(bColumns);
  }
  return multiplyMatricesInto(out, a, b);
}
