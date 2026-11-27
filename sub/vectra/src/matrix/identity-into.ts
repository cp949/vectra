import type { MatrixWritable } from '../types/flat-shapes.internal';

/**
 * identity matrix를 out에 기록하고 out을 반환한다.
 *
 * @param out identity component를 기록할 행렬 객체
 */
export function identityInto<Out extends MatrixWritable>(out: Out): Out {
  out.a = 1;
  out.b = 0;
  out.c = 0;
  out.d = 1;
  out.tx = 0;
  out.ty = 0;
  return out;
}
