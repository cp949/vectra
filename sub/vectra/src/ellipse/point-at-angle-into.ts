import type { Ellipse, PointWritable } from '../types/flat-shapes.internal';

/**
 * angle 위치의 ellipse 표면 point를 out에 기록하고 out을 반환한다.
 *
 * angle은 radian이다. 공식: (cx + cos(angle) * rx, cy + sin(angle) * ry).
 * rx <= 0 또는 ry <= 0인 empty ellipse는 center를 기록한다.
 *
 * @param out 표면 point를 기록할 객체
 * @param ellipse 표면 point를 계산할 ellipse
 * @param angle 표면 위치를 나타내는 radian angle
 */
export function pointAtAngleInto<Out extends PointWritable>(out: Out, ellipse: Ellipse, angle: number): Out {
  const cx = ellipse.cx;
  const cy = ellipse.cy;
  const rx = ellipse.rx;
  const ry = ellipse.ry;

  // empty ellipse이면 center를 기록한다
  if (rx <= 0 || ry <= 0) {
    out.x = cx;
    out.y = cy;
    return out;
  }

  out.x = cx + Math.cos(angle) * rx;
  out.y = cy + Math.sin(angle) * ry;
  return out;
}
