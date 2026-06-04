import type { RayWritable, XYInput } from '../types';
import { fromAngleInto } from './from-angle-into';

/**
 * origin과 radian 각도를 받아 단위 방향 벡터를 가진 새 plain object ray를 반환한다.
 *
 * `fromAngleInto`에 위임하는 companion wrapper다.
 */
export function fromAngle(origin: XYInput, angle: number): RayWritable {
  return fromAngleInto({ origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } }, origin, angle);
}
