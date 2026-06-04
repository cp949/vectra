import type { MatrixWritable } from '../types';

/**
 * identity matrix를 out에 기록하고 out을 반환한다.
 *
 * @param out identity component를 기록할 writable output
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
