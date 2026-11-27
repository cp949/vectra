import type { Matrix, MatrixWritable } from '../types/flat-shapes.internal';

/**
 * matrix의 6개 component를 out에 복사하고 out을 반환한다.
 *
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out matrix component를 기록할 행렬 객체
 * @param matrix 복사할 행렬
 */
export function copyInto<Out extends MatrixWritable>(out: Out, matrix: Matrix): Out {
  const { a, b, c, d, tx, ty } = matrix;
  out.a = a;
  out.b = b;
  out.c = c;
  out.d = d;
  out.tx = tx;
  out.ty = ty;
  return out;
}
