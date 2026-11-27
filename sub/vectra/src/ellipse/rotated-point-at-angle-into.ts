import type { PointWritable, RotatedEllipse } from '../types/flat-shapes.internal';

/**
 * rotated ellipse 위 angle 위치의 boundary point를 out에 기록하고 out을 반환한다.
 *
 * angle은 local ellipse parameter angle(radian)이다. world-space polar angle이 아니며
 * out-of-range wrap도 하지 않는다. 공식(φ = rotation, θ = angle):
 *   x = cx + cosφ·rx·cosθ - sinφ·ry·sinθ
 *   y = cy + sinφ·rx·cosθ + cosφ·ry·sinθ
 * rx <= 0 또는 ry <= 0인 empty ellipse는 center를 기록한다.
 *
 * @param out 결과를 기록할 점 객체
 * @param ellipse boundary point를 계산할 rotated ellipse
 * @param angle 표면 위치를 나타내는 local parameter angle(radian)
 */
export function rotatedPointAtAngleInto<Out extends PointWritable>(
  out: Out,
  ellipse: RotatedEllipse,
  angle: number
): Out {
  const { cx, cy, rx, ry } = ellipse;

  // empty ellipse이면 center를 기록한다
  if (rx <= 0 || ry <= 0) {
    out.x = cx;
    out.y = cy;
    return out;
  }

  const phi = ellipse.rotation;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const cosTheta = Math.cos(angle);
  const sinTheta = Math.sin(angle);
  const localX = rx * cosTheta;
  const localY = ry * sinTheta;
  out.x = cx + cosPhi * localX - sinPhi * localY;
  out.y = cy + sinPhi * localX + cosPhi * localY;
  return out;
}
