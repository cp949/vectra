import { wrapFloatHalfOpen } from '../math/wrap-float-half-open';

/**
 * radian angle을 half-open range [-π, π)로 감싼다.
 *
 * `Math.PI`는 `-Math.PI`로 감긴다. non-finite 입력은 RangeError를 던진다.
 *
 * @param radians 감쌀 radian angle
 */
export function wrapRadians(radians: number): number {
  return wrapFloatHalfOpen(radians, -Math.PI, Math.PI);
}
