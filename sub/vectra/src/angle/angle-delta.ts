import { assertFiniteNumbers } from '../math/range.internal';
import { wrapRadians } from './wrap-radians';

/**
 * 두 angle의 shortest delta를 반환한다.
 *
 * `wrapRadians(to - from)`을 계산해 결과를 `[-π, π)` 범위로 반환한다.
 * `Math.PI` 결과는 `-Math.PI`로 감긴다. non-finite 입력은 RangeError를 던진다.
 *
 * @param from 기준 angle (radian)
 * @param to 목표 angle (radian)
 */
export function angleDelta(from: number, to: number): number {
  assertFiniteNumbers([from, to]);

  return wrapRadians(to - from);
}
