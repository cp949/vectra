import { assertFiniteNumbers } from './interpolation.internal';

/**
 * current를 target 방향으로 최대 maxDelta만큼 이동한 값을 반환한다.
 *
 * `|target - current| <= maxDelta`이면 target을 반환한다.
 * `current === target`이면 current를 반환한다.
 * `maxDelta === 0`은 유효하며 current를 반환한다.
 * `maxDelta < 0`이면 RangeError를 던진다.
 * current, target은 finite number여야 한다.
 *
 * @param current 현재 값
 * @param target 이동 목표값
 * @param maxDelta 최대 이동량. 0 이상의 finite number여야 한다.
 */
export function moveToward(current: number, target: number, maxDelta: number): number {
  assertFiniteNumbers([current, target, maxDelta]);

  if (maxDelta < 0) {
    throw new RangeError('moveToward maxDelta must be non-negative');
  }

  const diff = target - current;
  const absDiff = Math.abs(diff);

  // 남은 거리가 maxDelta 이하이면 target에 도달한다
  if (absDiff <= maxDelta) {
    return target;
  }

  // target 방향으로 maxDelta만큼 이동한다
  return current + (diff / absDiff) * maxDelta;
}
