import type { Ellipse, EllipseWritable } from '../types/flat-shapes.internal';

/**
 * ellipse의 center와 반지름을 out에 복사하고 out을 반환한다.
 *
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out ellipse 값을 기록할 객체
 * @param ellipse 복사할 ellipse
 */
export function copyInto<Out extends EllipseWritable>(out: Out, ellipse: Ellipse): Out {
  const { cx, cy, rx, ry } = ellipse;
  out.cx = cx;
  out.cy = cy;
  out.rx = rx;
  out.ry = ry;
  return out;
}
