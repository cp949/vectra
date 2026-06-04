import { matrixMultiplyInto } from '../internal/matrix';
import type { MatrixLike, MatrixWritable } from '../types';

/**
 * left * matrix를 out에 기록하고 out을 반환한다.
 *
 * matrix의 왼쪽에 left를 곱한다. input과 out이 같은 object여도 안전하다.
 *
 * @param out multiply 결과를 기록할 writable output
 * @param matrix 오른쪽에 놓일 기준 matrix
 * @param left matrix 왼쪽에 곱할 matrix
 */
export function preMultiplyInto<Out extends MatrixWritable>(out: Out, matrix: MatrixLike, left: MatrixLike): Out {
  return matrixMultiplyInto(out, left, matrix);
}
