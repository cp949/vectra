import type { Ellipse, PointWritable } from '../types/flat-shapes.internal';

/**
 * angle 위치에서 ellipse의 접선 방향 벡터를 out에 기록하고 out을 반환한다.
 *
 * 공식: (-rx * sin(angle), ry * cos(angle)). 정규화하지 않는다.
 * rx <= 0 또는 ry <= 0인 empty ellipse는 zero vector (0, 0)을 기록한다.
 *
 * @param out 결과를 기록할 점 객체
 * @param ellipse 접선을 계산할 ellipse
 * @param angle 접선 위치를 나타내는 radian angle
 */
export function tangentAtInto<Out extends PointWritable>(out: Out, ellipse: Ellipse, angle: number): Out {
  const { rx, ry } = ellipse;

  if (rx <= 0 || ry <= 0) {
    out.x = 0;
    out.y = 0;
    return out;
  }

  out.x = -rx * Math.sin(angle);
  out.y = ry * Math.cos(angle);
  return out;
}
