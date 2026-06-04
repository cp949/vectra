import { combineMatricesInto } from './combine-matrices-into';
import type { MatLike } from './types';

/**
 * 두 matrix를 callback으로 합성한 결과 `[fn(a[r][c], b[r][c], r, c)]`을 새 `number[][]`로 반환한다.
 *
 * 두 matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 두 matrix의 shape가 다르면 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `fn`이 던진 예외는 그대로 전파한다.
 * `fn` 반환값은 finite number여야 한다. 위반 시 `RangeError`.
 * 빈 matrix `[]`(`shape = [0, 0]`)는 `fn`을 호출하지 않고 빈 배열 `[]`을 반환한다.
 *
 * @param a 합성에 사용할 첫 번째 matrix
 * @param b 합성에 사용할 두 번째 matrix. `a`와 같은 shape여야 한다.
 * @param fn `(aEntry, bEntry, row, column)`을 받아 entry 값을 반환하는 callback. finite number만 허용한다.
 */
export function combineMatrices(
  a: MatLike,
  b: MatLike,
  fn: (a: number, b: number, row: number, column: number) => number
): number[][] {
  const rows = a.length;
  const firstRow = a[0];
  const columns = Array.isArray(firstRow) ? firstRow.length : 0;
  const out: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    out[r] = new Array(columns);
  }
  return combineMatricesInto(out, a, b, fn);
}
