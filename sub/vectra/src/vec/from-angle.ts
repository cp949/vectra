import type { PointWritable } from '../types/flat-shapes.internal';
import { fromAngleInto } from './from-angle-into';

/**
 * 주어진 각도에 해당하는 unit vector (cos(angle), sin(angle))를 새 object로 반환한다.
 *
 * @param angle unit vector 방향각(라디안)
 */
export function fromAngle(angle: number): PointWritable {
  return fromAngleInto({ x: 0, y: 0 }, angle);
}
