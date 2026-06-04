import { assertMatrixOutCapacity } from './matrix-out-capacity.internal';
import type { MatWritable } from './types';
import { assertNonNegativeSafeInteger } from './validate.internal';

/**
 * `size x size` identity matrix를 `out`에 기록한다.
 *
 * `size`는 비음의 safe integer여야 한다. 위반 시 `RangeError`.
 * `out`은 최소 `size`개의 row를 가져야 하며 각 row(`r < size`)는 `size` 이상의 capacity를 가진 array여야 한다. 부족하면 `RangeError`.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다(모든 validation 성공 후에만 mutate).
 * 성공 시 `out[i][i] = 1`, 그 외 `out[i][j] = 0`을 기록하고 `out.length`는 `size`로, 각 row length는 `size`로 truncate된다.
 * `size === 0`은 `out.length = 0`만 설정한다.
 *
 * @param out matrix를 기록할 writable storage. `[size, size]`에 맞는 capacity가 준비되어 있어야 한다.
 * @param size identity matrix의 한 변 길이. 비음의 safe integer.
 */
export function identityInto<Out extends MatWritable>(out: Out, size: number): Out {
  assertNonNegativeSafeInteger(size, 'size');
  assertMatrixOutCapacity(out, size, size, 'out');
  for (let r = 0; r < size; r++) {
    const row = out[r];
    for (let c = 0; c < size; c++) {
      row[c] = r === c ? 1 : 0;
    }
    row.length = size;
  }
  out.length = size;
  return out;
}
