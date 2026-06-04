import type { MatrixWritable, XYInput } from '../types';
import { rotationAroundPointInto } from './rotation-around-point-into';

/**
 * point를 중심으로 rotation하는 matrix를 새 object로 반환한다.
 *
 * @param point rotation 중심점
 * @param angle rotation angle (radian)
 */
export function rotationAroundPoint(point: XYInput, angle: number): MatrixWritable {
  return rotationAroundPointInto({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }, point, angle);
}
