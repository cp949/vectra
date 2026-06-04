import { wrapFloatHalfOpen } from '../math/wrap-float-half-open';

/**
 * radian angle을 half-open range [0, 2π)로 감싼다.
 *
 * `2 * Math.PI`는 `0`으로 감긴다. `-Math.PI`는 `Math.PI`로 감긴다.
 * non-finite 입력은 RangeError를 던진다.
 *
 * @param radians 감쌀 radian angle
 */
export function wrapRadiansPositive(radians: number): number {
  return wrapFloatHalfOpen(radians, 0, 2 * Math.PI);
}
