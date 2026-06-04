import { assertFiniteNumbers, assertNonNegativeFiniteNumber } from '../math/range.internal';
import { angleDelta } from './angle-delta';

/**
 * current에서 target 방향으로 최대 maxDelta radian 이동한 angle을 반환한다.
 *
 * `|angleDelta(current, target)| <= maxDelta`이면 target을 반환한다.
 * 초과하면 shortest direction으로 maxDelta 이동한 값을 반환한다.
 *
 * `maxDelta >= 0` 요구. 음수 maxDelta는 RangeError를 던진다.
 * non-finite 입력은 RangeError를 던진다.
 *
 * @param current 현재 angle (radian)
 * @param target 목표 angle (radian)
 * @param maxDelta 최대 이동 radian (0 이상)
 */
export function moveTowardAngle(current: number, target: number, maxDelta: number): number {
  assertFiniteNumbers([current, target]);
  assertNonNegativeFiniteNumber(maxDelta);

  const delta = angleDelta(current, target);

  if (Math.abs(delta) <= maxDelta) {
    return target;
  }

  // shortest direction으로 maxDelta 이동
  return current + Math.sign(delta) * maxDelta;
}
