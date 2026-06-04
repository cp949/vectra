import type { MatrixLike, MatrixWritable } from '../types';
import { preMultiplyInto } from './pre-multiply-into';

/**
 * `left * matrix`를 새 plain object로 반환한다.
 *
 * matrix의 왼쪽에 left를 곱한다. `preMultiplyInto`의 allocating companion이다.
 *
 * @param matrix 오른쪽에 놓일 기준 matrix
 * @param left matrix 왼쪽에 곱할 matrix
 */
export function preMultiply(matrix: MatrixLike, left: MatrixLike): MatrixWritable {
  return preMultiplyInto({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }, matrix, left);
}
