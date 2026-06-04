import type { MatrixWritable } from '../types';
import { skewXInto } from './skew-x-into';

/**
 * X축 skew matrix를 새 object로 반환한다.
 *
 * angle은 radian이다.
 *
 * @param angle X축 skew angle (radian)
 */
export function skewX(angle: number): MatrixWritable {
  return skewXInto({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }, angle);
}
