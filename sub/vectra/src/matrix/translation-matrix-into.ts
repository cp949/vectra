import type { MatrixWritable, Point } from '../types/flat-shapes.internal';

/**
 * identity 기반 translation matrix를 out에 기록하고 out을 반환한다.
 *
 * 기존 matrix를 합성하지 않고, offset으로부터 translation-only component matrix를 새로 생성한다.
 *
 * @param out translation component를 기록할 행렬 객체
 * @param offset matrix의 tx/ty로 기록할 translation offset
 */
export function translationMatrixInto<Out extends MatrixWritable>(out: Out, offset: Point): Out {
  out.a = 1;
  out.b = 0;
  out.c = 0;
  out.d = 1;
  out.tx = offset.x;
  out.ty = offset.y;
  return out;
}
