import type { MatrixLike, MatrixWritable } from '../types';
import { createMatrix } from './create-matrix';
import { multiplyInto } from './multiply-into';

/**
 * `left * right`를 새 plain matrix로 반환한다.
 *
 * point transform 기준으로 right를 먼저 적용하고 left를 나중에 적용한 composition이다.
 *
 * @param left 왼쪽에 곱할 matrix
 * @param right 오른쪽에 곱할 matrix
 */
export function multiply(left: MatrixLike, right: MatrixLike): MatrixWritable {
  return multiplyInto(createMatrix(), left, right);
}
