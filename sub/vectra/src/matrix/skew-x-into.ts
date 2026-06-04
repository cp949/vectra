import type { MatrixWritable } from '../types';

/**
 * X축 skew matrix를 out에 기록하고 out을 반환한다.
 *
 * angle은 radian이다. 결과 matrix: `a=1, b=0, c=tan(angle), d=1, tx=0, ty=0`.
 *
 * @param out skew component를 기록할 writable output
 * @param angle X축 skew angle (radian)
 */
export function skewXInto<Out extends MatrixWritable>(out: Out, angle: number): Out {
  out.a = 1;
  out.b = 0;
  out.c = Math.tan(angle);
  out.d = 1;
  out.tx = 0;
  out.ty = 0;
  return out;
}
