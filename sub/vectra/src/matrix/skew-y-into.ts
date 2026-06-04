import type { MatrixWritable } from '../types';

/**
 * Y축 skew matrix를 out에 기록하고 out을 반환한다.
 *
 * angle은 radian이다. 결과 matrix: `a=1, b=tan(angle), c=0, d=1, tx=0, ty=0`.
 *
 * @param out skew component를 기록할 writable output
 * @param angle Y축 skew angle (radian)
 */
export function skewYInto<Out extends MatrixWritable>(out: Out, angle: number): Out {
  out.a = 1;
  out.b = Math.tan(angle);
  out.c = 0;
  out.d = 1;
  out.tx = 0;
  out.ty = 0;
  return out;
}
