import type { Ellipse, PointWritable } from '../types/flat-shapes.internal';

/**
 * angle 위치에서 ellipse의 법선 방향 벡터를 out에 기록하고 out을 반환한다.
 *
 * 공식: (cos(angle) / rx, sin(angle) / ry). 정규화하지 않는다.
 * rx <= 0 또는 ry <= 0인 empty ellipse는 zero vector (0, 0)을 기록한다.
 *
 * @param out 법선 방향 벡터를 기록할 객체
 * @param ellipse 법선을 계산할 ellipse
 * @param angle 법선 위치를 나타내는 radian angle
 */
export function normalAtInto<Out extends PointWritable>(out: Out, ellipse: Ellipse, angle: number): Out {
  const rx = ellipse.rx;
  const ry = ellipse.ry;

  // empty ellipse이면 zero vector를 기록한다 (공식 적용 시 division-by-zero 발생)
  if (rx <= 0 || ry <= 0) {
    out.x = 0;
    out.y = 0;
    return out;
  }

  out.x = Math.cos(angle) / rx;
  out.y = Math.sin(angle) / ry;
  return out;
}
