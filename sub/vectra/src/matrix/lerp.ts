import type { MatrixLike, MatrixWritable } from '../types';
import { lerpInto } from './lerp-into';

/**
 * 두 matrix a, b를 parameter t로 component-wise 선형 보간한 결과를 새 object로 반환한다.
 *
 * t는 clamp하지 않으므로 t < 0 또는 t > 1로 extrapolation이 가능하다.
 * t가 NaN/Infinity이면 결과가 정의되지 않는다 (caller 책임).
 *
 * @param a 시작 matrix (t = 0일 때 결과)
 * @param b 끝 matrix (t = 1일 때 결과)
 * @param t 보간 parameter. clamp 없이 extrapolation 허용.
 */
export function lerp(a: MatrixLike, b: MatrixLike, t: number): MatrixWritable {
  return lerpInto({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }, a, b, t);
}
