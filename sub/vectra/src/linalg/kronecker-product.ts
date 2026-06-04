import { kroneckerProductInto } from './kronecker-product-into';
import type { MatLike } from './types';

/**
 * 두 matrix의 Kronecker product `[a[i][j] * b[p][q]]`를 새 `number[][]`로 반환한다.
 *
 * 결과 shape는 `[a.rows * b.rows, a.columns * b.columns]`이다. row 순서는 `i * b.rows + p`,
 * column 순서는 `j * b.columns + q`이다.
 * 두 matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 결과 shape `[a.rows * b.rows, a.columns * b.columns]`는 safe integer 범위여야 한다. 위반 시 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * 모든 출력 entry(`a[i][j] * b[p][q]`)가 finite number여야 한다. 위반 시 `RangeError`.
 * `a` 또는 `b`가 빈 matrix `[]`이면 빈 배열 `[]`을 반환한다.
 *
 * @param a Kronecker product의 좌측 matrix
 * @param b Kronecker product의 우측 matrix
 */
export function kroneckerProduct(a: MatLike, b: MatLike): number[][] {
  const aRows = a.length;
  const bRows = b.length;
  const aFirstRow = a[0];
  const bFirstRow = b[0];
  const aColumns = Array.isArray(aFirstRow) ? aFirstRow.length : 0;
  const bColumns = Array.isArray(bFirstRow) ? bFirstRow.length : 0;
  const resultRows = aRows * bRows;
  const resultColumns = aColumns * bColumns;
  const out: number[][] = new Array(resultRows);
  for (let r = 0; r < resultRows; r++) {
    out[r] = new Array(resultColumns);
  }
  return kroneckerProductInto(out, a, b);
}
