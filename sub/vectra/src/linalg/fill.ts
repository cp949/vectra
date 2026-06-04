import { fillInto } from './fill-into';
import type { MatrixShape } from './types';
import { assertFiniteNumber, assertMatrixShape } from './validate.internal';

/**
 * `shape`에 맞는 matrix를 `value`로 채운 새 `number[][]`를 반환한다.
 *
 * `shape`는 비음의 safe integer 쌍이며 one-sided zero shape이 아니어야 한다. 위반 시 `RangeError`.
 * `value`는 finite number여야 한다. 위반 시 `RangeError`.
 * `[0, 0]` shape는 `[]`를 반환한다.
 *
 * @param shape 생성할 matrix의 `[rows, columns]`. 비음의 safe integer 쌍.
 * @param value 모든 entry에 기록할 finite number.
 */
export function fill(shape: MatrixShape, value: number): number[][] {
  assertMatrixShape(shape, 'shape');
  assertFiniteNumber(value, 'value');
  const [rows, columns] = shape;
  const out: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    out[r] = new Array(columns);
  }
  return fillInto(out, shape, value);
}
