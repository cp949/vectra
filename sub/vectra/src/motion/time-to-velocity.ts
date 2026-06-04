import { assertFiniteScalar, finalizeScalarResult } from './scalar.internal';

/**
 * 시작 속도에서 목표 속도에 도달하는 시간을 반환한다. 수식은
 * `(finalVelocity - initialVelocity) / acceleration`이다.
 *
 * 모든 입력은 finite number여야 한다. `NaN`, `Infinity`, `-Infinity`는 `RangeError`.
 * `acceleration === 0`이고 `finalVelocity === initialVelocity`이면 earliest solution `0`을 반환한다.
 * `acceleration === 0`인데 두 속도가 다르면 도달 불가이므로 `undefined`.
 * overflow로 결과가 non-finite면 `RangeError`. `-0` 결과는 `0`으로 반환한다.
 *
 * @param initialVelocity 시작 속도 v0
 * @param acceleration 상수 가속도 a
 * @param finalVelocity 목표 속도 v1
 */
export function timeToVelocity(
  initialVelocity: number,
  acceleration: number,
  finalVelocity: number
): number | undefined {
  assertFiniteScalar(initialVelocity, 'initialVelocity');
  assertFiniteScalar(acceleration, 'acceleration');
  assertFiniteScalar(finalVelocity, 'finalVelocity');

  if (acceleration === 0) {
    return finalVelocity === initialVelocity ? 0 : undefined;
  }

  return finalizeScalarResult((finalVelocity - initialVelocity) / acceleration, 'timeToVelocity');
}
