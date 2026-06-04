import {
  readRotatedEllipseCenter,
  readRotatedEllipseRadiusX,
  readRotatedEllipseRadiusY,
  readRotatedEllipseRotation,
} from '../internal/ellipse';
import { readX, readY, writeXY } from '../internal/xy';
import type { RotatedEllipseLike, XYWritable } from '../types';

/**
 * rotated ellipse 위 angle 위치의 boundary point를 out에 기록하고 out을 반환한다.
 *
 * angle은 local ellipse parameter angle(radian)이다. world-space polar angle이 아니며
 * out-of-range wrap도 하지 않는다. 공식(φ = rotation, θ = angle):
 *   x = cx + cosφ·radiusX·cosθ - sinφ·radiusY·sinθ
 *   y = cy + sinφ·radiusX·cosθ + cosφ·radiusY·sinθ
 * radiusX <= 0 또는 radiusY <= 0인 empty ellipse는 center를 기록한다.
 *
 * @param out boundary point를 기록할 writable output
 * @param ellipse boundary point를 계산할 rotated ellipse
 * @param angle 표면 위치를 나타내는 local parameter angle(radian)
 */
export function rotatedPointAtAngleInto<Out extends XYWritable>(
  out: Out,
  ellipse: RotatedEllipseLike,
  angle: number
): Out {
  const center = readRotatedEllipseCenter(ellipse);
  const cx = readX(center);
  const cy = readY(center);
  const rx = readRotatedEllipseRadiusX(ellipse);
  const ry = readRotatedEllipseRadiusY(ellipse);

  // empty ellipse이면 center를 기록한다
  if (rx <= 0 || ry <= 0) return writeXY(out, cx, cy);

  const phi = readRotatedEllipseRotation(ellipse);
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const cosTheta = Math.cos(angle);
  const sinTheta = Math.sin(angle);
  const localX = rx * cosTheta;
  const localY = ry * sinTheta;
  return writeXY(out, cx + cosPhi * localX - sinPhi * localY, cy + sinPhi * localX + cosPhi * localY);
}
