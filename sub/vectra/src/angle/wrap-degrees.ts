import { wrapFloatHalfOpen } from '../math/wrap-float-half-open';

/**
 * degree angle을 half-open range [-180, 180)로 감싼다.
 *
 * `180`은 `-180`으로 감긴다. non-finite 입력은 RangeError를 던진다.
 *
 * @param degrees 감쌀 degree angle
 */
export function wrapDegrees(degrees: number): number {
  return wrapFloatHalfOpen(degrees, -180, 180);
}
