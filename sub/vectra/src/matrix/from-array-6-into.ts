import type { MatrixTuple, MatrixWritable } from '../types';

/**
 * 6-element array에서 matrix component를 읽어 out에 기록하고 out을 반환한다.
 *
 * array 순서: `[a, b, c, d, tx, ty]`. MatrixTuple과 동일한 순서이다.
 * NaN/Infinity 입력은 검증 없이 pass through한다. caller 책임이다.
 *
 * @param out matrix component를 기록할 writable output
 * @param array 읽을 6-element readonly tuple `[a, b, c, d, tx, ty]`
 */
export function fromArray6Into<Out extends MatrixWritable>(out: Out, array: MatrixTuple): Out {
  out.a = array[0];
  out.b = array[1];
  out.c = array[2];
  out.d = array[3];
  out.tx = array[4];
  out.ty = array[5];
  return out;
}
