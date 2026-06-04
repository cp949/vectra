import type { MatrixWritable } from '../types';
import { skewYInto } from './skew-y-into';

/**
 * Y축 skew matrix를 새 object로 반환한다.
 *
 * angle은 radian이다.
 *
 * @param angle Y축 skew angle (radian)
 */
export function skewY(angle: number): MatrixWritable {
  return skewYInto({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }, angle);
}
