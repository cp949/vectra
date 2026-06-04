import type { MatWritable } from './types';

/**
 * matrix `out` storage가 `[rows, columns]` shape를 담을 capacity를 가졌는지 검증한다.
 *
 * `out.length >= rows`이고 각 `out[r]`(`r < rows`)가 array이며 `out[r].length >= columns`여야 한다.
 * 부족하면 `RangeError`를 던지고 `out`은 수정하지 않는다.
 *
 * caller가 모든 입력 validation을 통과한 뒤 commit 직전 단계에서 호출한다.
 *
 * @param out 검증할 matrix output storage
 * @param rows 필요한 row 개수. 비음의 safe integer.
 * @param columns 필요한 각 row의 column 개수. 비음의 safe integer.
 * @param name error message에 사용할 인자 이름
 */
export function assertMatrixOutCapacity(out: MatWritable, rows: number, columns: number, name: string): void {
  if (out.length < rows) {
    throw new RangeError(`${name} row count (${out.length}) is less than required rows (${rows})`);
  }
  for (let r = 0; r < rows; r++) {
    const row = out[r];
    if (!Array.isArray(row)) {
      throw new RangeError(`${name}[${r}] must be an array with capacity >= ${columns}`);
    }
    if (row.length < columns) {
      throw new RangeError(`${name}[${r}] capacity (${row.length}) is less than required columns (${columns})`);
    }
  }
}
