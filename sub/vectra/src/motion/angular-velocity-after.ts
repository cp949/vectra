import { assertFiniteScalar, finalizeScalarResult } from './scalar.internal';

/**
 * 상수 angular acceleration에서 경과 시간 후 angular velocity를 반환한다. 수식은
 * `initialAngularVelocity + angularAcceleration * duration`이다.
 *
 * angular velocity는 radian/time이며 결과를 normalize하지 않는다.
 * 모든 입력은 finite number여야 한다. `NaN`, `Infinity`, `-Infinity`는 `RangeError`.
 * `duration < 0`은 역방향 closed-form evaluation으로 허용한다.
 * overflow로 결과가 non-finite면 `RangeError`. `-0` 결과는 `0`으로 반환한다.
 *
 * @param initialAngularVelocity 초기 angular velocity ω0 (radian/time)
 * @param angularAcceleration 상수 angular acceleration (radian/time^2)
 * @param duration 경과 시간 t. 음수는 역방향 평가다.
 */
export function angularVelocityAfter(
  initialAngularVelocity: number,
  angularAcceleration: number,
  duration: number
): number {
  assertFiniteScalar(initialAngularVelocity, 'initialAngularVelocity');
  assertFiniteScalar(angularAcceleration, 'angularAcceleration');
  assertFiniteScalar(duration, 'duration');

  return finalizeScalarResult(initialAngularVelocity + angularAcceleration * duration, 'angularVelocityAfter');
}
