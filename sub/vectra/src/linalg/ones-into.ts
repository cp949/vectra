import { assertMatrixOutCapacity } from './matrix-out-capacity.internal';
import type { MatrixShape, MatWritable } from './types';
import { assertMatrixShape } from './validate.internal';

/**
 * `shape`에 맞는 one matrix(모든 entry가 1)를 `out`에 기록한다.
 *
 * `shape`는 비음의 safe integer 쌍이며 one-sided zero shape이 아니어야 한다. 위반 시 `RangeError`.
 * `out`은 최소 `rows`개의 row를 가져야 하며 각 row(`r < rows`)는 `columns` 이상의 capacity를 가진 array여야 한다. 부족하면 `RangeError`.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다(모든 validation 성공 후에만 mutate).
 * 성공 시 각 row를 1로 채우고 `out.length`는 `rows`로, 각 row length는 `columns`로 truncate된다.
 * `[0, 0]` shape는 `out.length = 0`만 설정한다.
 *
 * @param out matrix를 기록할 writable storage. shape에 맞는 row와 column capacity가 준비되어 있어야 한다.
 * @param shape 생성할 matrix의 `[rows, columns]`. 비음의 safe integer 쌍.
 */
export function onesInto<Out extends MatWritable>(out: Out, shape: MatrixShape): Out {
  assertMatrixShape(shape, 'shape');
  const [rows, columns] = shape;
  assertMatrixOutCapacity(out, rows, columns, 'out');
  for (let r = 0; r < rows; r++) {
    const row = out[r];
    for (let c = 0; c < columns; c++) {
      row[c] = 1;
    }
    row.length = columns;
  }
  out.length = rows;
  return out;
}
