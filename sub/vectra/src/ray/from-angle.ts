import type { RayWritable, Point } from '../types/flat-shapes.internal';
import { fromAngleInto } from './from-angle-into';

/**
 * origin과 radian 각도를 받아 단위 방향 벡터를 가진 새 plain object ray를 반환한다.
 *
 * `fromAngleInto`에 위임하는 companion wrapper다.
 */
export function fromAngle(origin: Point, angle: number): RayWritable {
  return fromAngleInto({ ox: 0, oy: 0, dx: 0, dy: 0 }, origin, angle);
}
