import { assertMatrixOutCapacity } from './matrix-out-capacity.internal';
import type { MatWritable } from './types';

/**
 * temp matrix를 `out`에 commit한다.
 *
 * caller가 입력 검증과 finite result 검증을 모두 끝낸 뒤 호출한다.
 * `out` capacity가 부족하면 `RangeError`를 던지고 `out`은 호출 전 상태 그대로 남는다.
 * 성공 시 `out[r][c] = temp[r][c]`를 기록하고 `out.length`는 `rows`로, 각 row length는 `columns`로 truncate된다.
 * `temp`는 `out`과 다른 array 인스턴스여야 한다. aliasing 보호는 caller가 fresh `number[][]`을 만드는 방식으로 보장한다.
 *
 * @param out 결과를 commit할 writable matrix
 * @param temp commit할 source matrix. shape는 `[rows, columns]`.
 * @param rows commit할 row 개수. 비음의 safe integer.
 * @param columns commit할 column 개수. 비음의 safe integer.
 * @param name error message에 사용할 `out` 인자 이름
 */
export function commitMatrixInto(
  out: MatWritable,
  temp: readonly (readonly number[])[],
  rows: number,
  columns: number,
  name: string
): void {
  assertMatrixOutCapacity(out, rows, columns, name);
  for (let r = 0; r < rows; r++) {
    const outRow = out[r];
    const src = temp[r];
    for (let c = 0; c < columns; c++) {
      outRow[c] = src[c];
    }
    outRow.length = columns;
  }
  out.length = rows;
}
