import type { Circle, PointWritable } from '../types/flat-shapes.internal';

/**
 * angle 위치의 circle 표면 point를 out에 기록하고 out을 반환한다.
 *
 * angle은 radian이다. radius <= 0인 empty circle은 center를 기록한다.
 *
 * @param out 결과를 기록할 점 객체
 * @param circle 표면 point를 계산할 circle
 * @param angle 표면 위치를 나타내는 radian angle
 */
export function pointAtAngleInto<Out extends PointWritable>(out: Out, circle: Circle, angle: number): Out {
  const cx = circle.cx;
  const cy = circle.cy;
  const r = circle.r;

  if (r <= 0) {
    out.x = cx;
    out.y = cy;
    return out;
  }

  out.x = cx + r * Math.cos(angle);
  out.y = cy + r * Math.sin(angle);
  return out;
}
