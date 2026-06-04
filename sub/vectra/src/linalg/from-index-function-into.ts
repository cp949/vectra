import { assertMatrixOutCapacity } from './matrix-out-capacity.internal';
import type { MatrixShape, MatWritable } from './types';
import { assertMatrixShape } from './validate.internal';

/**
 * `shape`에 맞는 matrix를 `fn(row, column)`으로 계산해 `out`에 기록한다.
 *
 * `shape`는 비음의 safe integer 쌍이며 one-sided zero shape이 아니어야 한다. 위반 시 `RangeError`.
 * `out`은 최소 `rows`개의 row를 가져야 하며 각 row(`r < rows`)는 `columns` 이상의 capacity를 가진 array여야 한다. 부족하면 `RangeError`.
 * `fn(r, c)`는 finite number를 반환해야 한다. 위반 시 `RangeError`.
 * `fn` 안에서 던진 예외는 그대로 전파한다.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다(모든 callback 호출이 성공한 뒤에만 mutate).
 * 성공 시 `out[r][c] = fn(r, c)`를 기록하고 `out.length`는 `rows`로, 각 row length는 `columns`로 truncate된다.
 * `[0, 0]` shape는 `fn`을 호출하지 않고 `out.length = 0`만 설정한다.
 *
 * @param out matrix를 기록할 writable storage. shape에 맞는 row와 column capacity가 준비되어 있어야 한다.
 * @param shape 생성할 matrix의 `[rows, columns]`. 비음의 safe integer 쌍.
 * @param fn `(row, column)`을 받아 entry 값을 반환하는 callback. finite number만 허용한다.
 */
export function fromIndexFunctionInto<Out extends MatWritable>(
  out: Out,
  shape: MatrixShape,
  fn: (row: number, column: number) => number
): Out {
  assertMatrixShape(shape, 'shape');
  const [rows, columns] = shape;
  assertMatrixOutCapacity(out, rows, columns, 'out');
  const temp: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    const row = new Array(columns);
    for (let c = 0; c < columns; c++) {
      const value = fn(r, c);
      if (!Number.isFinite(value)) {
        throw new RangeError(`fn(${r}, ${c}) must return a finite number, got ${String(value)}`);
      }
      row[c] = value;
    }
    temp[r] = row;
  }
  for (let r = 0; r < rows; r++) {
    const row = out[r];
    const src = temp[r];
    for (let c = 0; c < columns; c++) {
      row[c] = src[c];
    }
    row.length = columns;
  }
  out.length = rows;
  return out;
}
