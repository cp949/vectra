import type { Ellipse, PointWritable } from '../types/flat-shapes.internal';
import { pointAtAngleInto } from './point-at-angle-into';

/**
 * angle 위치의 ellipse 표면 point를 plain object로 반환한다.
 *
 * angle은 radian이다. 공식: (cx + cos(angle) * rx, cy + sin(angle) * ry).
 * rx <= 0 또는 ry <= 0인 empty ellipse는 center를 반환한다.
 *
 * @param ellipse 표면 point를 계산할 ellipse
 * @param angle 표면 위치를 나타내는 radian angle
 */
export function pointAtAngle(ellipse: Ellipse, angle: number): PointWritable {
  return pointAtAngleInto({ x: 0, y: 0 }, ellipse, angle);
}
