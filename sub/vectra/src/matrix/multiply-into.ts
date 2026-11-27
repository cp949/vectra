import { matrixMultiplyInto } from '../internal/matrix';
import type { Matrix, MatrixWritable } from '../types/flat-shapes.internal';

/**
 * left * right를 out에 기록하고 out을 반환한다.
 *
 * point transform 기준으로 right를 먼저 적용하고 left를 나중에 적용한 composition이다.
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out multiply 결과를 기록할 객체
 * @param left 왼쪽에 곱할 matrix
 * @param right 오른쪽에 곱할 matrix
 */
export function multiplyInto<Out extends MatrixWritable>(out: Out, left: Matrix, right: Matrix): Out {
  return matrixMultiplyInto(out, left, right);
}
