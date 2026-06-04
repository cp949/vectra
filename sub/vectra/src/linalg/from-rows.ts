import type { MatLike } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * `rows` matrix를 deep copy한 새 `number[][]`로 반환한다.
 *
 * `rows`는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * 빈 matrix `[]`는 빈 배열 `[]`을 반환한다.
 * 결과는 input row 참조를 공유하지 않는 새 nested array다.
 *
 * @param rows 복사할 matrix. row-major nested array.
 */
export function fromRows(rows: MatLike): number[][] {
  const [rowCount, columnCount] = extractMatrixShape(rows, 'rows');
  assertFiniteMatrixEntries(rows, [rowCount, columnCount], 'rows');
  const out: number[][] = new Array(rowCount);
  for (let r = 0; r < rowCount; r++) {
    const src = rows[r];
    const dst = new Array(columnCount);
    for (let c = 0; c < columnCount; c++) {
      dst[c] = src[c];
    }
    out[r] = dst;
  }
  return out;
}
