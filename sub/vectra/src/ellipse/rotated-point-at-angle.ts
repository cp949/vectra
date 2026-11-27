import type { RotatedEllipse, PointWritable } from '../types/flat-shapes.internal';
import { rotatedPointAtAngleInto } from './rotated-point-at-angle-into';

/**
 * rotated ellipse 위 angle 위치의 boundary point를 plain object로 반환한다.
 *
 * angle은 local ellipse parameter angle(radian)이다. world-space polar angle이 아니며
 * out-of-range wrap도 하지 않는다. 공식(φ = rotation, θ = angle):
 *   x = cx + cosφ·rx·cosθ - sinφ·ry·sinθ
 *   y = cy + sinφ·rx·cosθ + cosφ·ry·sinθ
 * rx <= 0 또는 ry <= 0인 empty ellipse는 center를 반환한다.
 *
 * @param ellipse boundary point를 계산할 rotated ellipse
 * @param angle 표면 위치를 나타내는 local parameter angle(radian)
 */
export function rotatedPointAtAngle(ellipse: RotatedEllipse, angle: number): PointWritable {
  return rotatedPointAtAngleInto({ x: 0, y: 0 }, ellipse, angle);
}
