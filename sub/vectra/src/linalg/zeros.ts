import type { MatrixShape } from './types';
import { assertMatrixShape } from './validate.internal';
import { zerosInto } from './zeros-into';

/**
 * `shape`에 맞는 zero matrix를 새 `number[][]`로 반환한다.
 *
 * `shape`는 비음의 safe integer 쌍이며 one-sided zero shape이 아니어야 한다. 위반 시 `RangeError`.
 * `[0, 0]` shape는 `[]`를 반환한다.
 *
 * @param shape 생성할 matrix의 `[rows, columns]`. 비음의 safe integer 쌍.
 */
export function zeros(shape: MatrixShape): number[][] {
  assertMatrixShape(shape, 'shape');
  const [rows, columns] = shape;
  const out: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    out[r] = new Array(columns);
  }
  return zerosInto(out, shape);
}
