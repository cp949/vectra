import type { Circle, CircleWritable } from '../types/flat-shapes.internal';

/**
 * circle의 center와 radius를 out에 복사하고 out을 반환한다.
 *
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 원 객체
 * @param circle 복사할 circle
 */
export function copyInto<Out extends CircleWritable>(out: Out, circle: Circle): Out {
  const { cx, cy, r } = circle;
  out.cx = cx;
  out.cy = cy;
  out.r = r;
  return out;
}
