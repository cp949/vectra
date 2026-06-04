import type { RotatedEllipseLike, XYObjectWritable } from '../types';
import { rotatedPointAtAngleInto } from './rotated-point-at-angle-into';

/**
 * rotated ellipse 위 angle 위치의 boundary point를 plain object로 반환한다.
 *
 * angle은 local ellipse parameter angle(radian)이다. world-space polar angle이 아니며
 * out-of-range wrap도 하지 않는다. 공식(φ = rotation, θ = angle):
 *   x = cx + cosφ·radiusX·cosθ - sinφ·radiusY·sinθ
 *   y = cy + sinφ·radiusX·cosθ + cosφ·radiusY·sinθ
 * radiusX <= 0 또는 radiusY <= 0인 empty ellipse는 center를 반환한다.
 *
 * @param ellipse boundary point를 계산할 rotated ellipse
 * @param angle 표면 위치를 나타내는 local parameter angle(radian)
 */
export function rotatedPointAtAngle(ellipse: RotatedEllipseLike, angle: number): XYObjectWritable {
  return rotatedPointAtAngleInto({ x: 0, y: 0 }, ellipse, angle);
}
