import { assertNonNegativeScalar, assertPositiveScalar, finalizeScalarResult } from './scalar.internal';

/**
 * 등속 이동에서 거리를 이동하는 데 걸리는 시간을 반환한다. 수식은 `distance / speed`이다.
 *
 * `distance`는 음수가 아닌 finite number여야 한다. 음수나 non-finite는 `RangeError`. `distance === 0`은 `0`.
 * `speed`는 양수 finite number여야 한다. `0` 이하나 non-finite는 `RangeError`.
 * overflow로 결과가 non-finite면 `RangeError`. `-0` 결과는 `0`으로 반환한다.
 *
 * @param distance 이동 거리. 음수가 아니다.
 * @param speed 양수 이동 속력
 */
export function durationByDistance(distance: number, speed: number): number {
  assertNonNegativeScalar(distance, 'distance');
  assertPositiveScalar(speed, 'speed');

  return finalizeScalarResult(distance / speed, 'durationByDistance');
}
