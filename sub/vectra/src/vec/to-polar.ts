import type { XYInput } from '../types';
import { type PolarWritable, toPolarInto } from './to-polar-into';

/**
 * XY 벡터를 극좌표로 변환해 새 `PolarWritable` object로 반환한다.
 *
 * r은 벡터의 길이 (항상 ≥ 0), theta는 x축으로부터의 각도 (라디안).
 * theta 범위: `Math.atan2`를 사용하므로 (-π, π].
 * zero-vector 입력 시 r = 0, theta = atan2(0, 0) = 0.
 * non-finite 입력(NaN, ±Infinity)은 그대로 pass-through한다. caller가 책임진다.
 *
 * @param v 극좌표로 변환할 XY 벡터
 */
export function toPolar(v: XYInput): PolarWritable {
  return toPolarInto({ r: 0, theta: 0 }, v);
}
