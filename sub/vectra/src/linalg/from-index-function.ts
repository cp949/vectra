import { fromIndexFunctionInto } from './from-index-function-into';
import type { MatrixShape } from './types';
import { assertMatrixShape } from './validate.internal';

/**
 * `shape`에 맞는 matrix를 `fn(row, column)`으로 계산해 새 `number[][]`로 반환한다.
 *
 * `shape`는 비음의 safe integer 쌍이며 one-sided zero shape이 아니어야 한다. 위반 시 `RangeError`.
 * `fn(r, c)`는 finite number를 반환해야 한다. 위반 시 `RangeError`.
 * `fn` 안에서 던진 예외는 그대로 전파한다.
 * `[0, 0]` shape는 `fn`을 호출하지 않고 `[]`를 반환한다.
 *
 * @param shape 생성할 matrix의 `[rows, columns]`. 비음의 safe integer 쌍.
 * @param fn `(row, column)`을 받아 entry 값을 반환하는 callback. finite number만 허용한다.
 */
export function fromIndexFunction(shape: MatrixShape, fn: (row: number, column: number) => number): number[][] {
  assertMatrixShape(shape, 'shape');
  const [rows, columns] = shape;
  const out: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    out[r] = new Array(columns);
  }
  return fromIndexFunctionInto(out, shape, fn);
}
