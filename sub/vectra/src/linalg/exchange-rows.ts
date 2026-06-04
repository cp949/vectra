import { exchangeRowsInto } from './exchange-rows-into';
import type { MatLike } from './types';

/**
 * `matrix`의 `first`와 `second` row를 swap한 결과를 새 `number[][]`로 반환한다.
 *
 * `first === second`이면 no-op로 처리하며 원본을 그대로 복사한다.
 * `matrix`는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `first`, `second`는 `0 <= index < rows`인 정수여야 한다. NaN, Infinity, 비정수, 음수, 범위
 * 초과는 `RangeError`.
 * 결과는 input row 참조를 공유하지 않는 새 nested array다.
 *
 * @param matrix row 교환을 적용할 source matrix
 * @param first 교환할 첫 row index. 0-based 정수.
 * @param second 교환할 두 번째 row index. 0-based 정수.
 */
export function exchangeRows(matrix: MatLike, first: number, second: number): number[][] {
  const rows = matrix.length;
  const firstRow = matrix[0];
  const columns = Array.isArray(firstRow) ? firstRow.length : 0;
  const out: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    out[r] = new Array(columns);
  }
  return exchangeRowsInto(out, matrix, first, second);
}
