import type { CircleLike, XYObjectWritable } from '../types';
import { pointAtAngleInto } from './point-at-angle-into';

/**
 * angle 위치의 circle 표면 point를 새 object로 반환한다.
 *
 * angle은 radian이다. radius <= 0인 empty circle은 center 좌표를 반환한다.
 *
 * @param circle 표면 point를 계산할 circle
 * @param angle 표면 위치를 나타내는 radian angle
 */
export function pointAtAngle(circle: CircleLike, angle: number): XYObjectWritable {
  return pointAtAngleInto({ x: 0, y: 0 }, circle, angle);
}
