import type { EllipseLike, XYObjectWritable } from '../types';
import { pointAtAngleInto } from './point-at-angle-into';

/**
 * angle 위치의 ellipse 표면 point를 plain object로 반환한다.
 *
 * angle은 radian이다. 공식: (cx + cos(angle) * radiusX, cy + sin(angle) * radiusY).
 * radiusX <= 0 또는 radiusY <= 0인 empty ellipse는 center를 반환한다.
 *
 * @param ellipse 표면 point를 계산할 ellipse
 * @param angle 표면 위치를 나타내는 radian angle
 */
export function pointAtAngle(ellipse: EllipseLike, angle: number): XYObjectWritable {
  return pointAtAngleInto({ x: 0, y: 0 }, ellipse, angle);
}
