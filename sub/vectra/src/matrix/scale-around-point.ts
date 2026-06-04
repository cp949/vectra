import type { MatrixWritable, XYInput } from '../types';
import { scaleAroundPointInto } from './scale-around-point-into';

/**
 * point를 중심으로 scale하는 matrix를 새 object로 반환한다.
 *
 * `scale`이 `number`이면 uniform scale (sx = sy = scale),
 * `XYInput`이면 non-uniform scale (sx = scale.x, sy = scale.y).
 *
 * @param point scale 중심점
 * @param scale uniform(`number`) 또는 non-uniform(`XYInput`) scale
 */
export function scaleAroundPoint(point: XYInput, scale: number | XYInput): MatrixWritable {
  return scaleAroundPointInto({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }, point, scale);
}
