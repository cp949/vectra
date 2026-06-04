import { assertFiniteScalar, finalizeScalarResult } from './scalar.internal';

/**
 * 상수 angular velocity로 경과 시간 동안 회전한 raw angular displacement를 반환한다. 수식은
 * `angularVelocity * duration`이다.
 *
 * angle은 radian이며 결과를 `[-π, π)`로 normalize하지 않는다. 여러 바퀴 회전은 그대로 누적된다.
 * `angularVelocity`, `duration`은 finite number여야 한다. `NaN`, `Infinity`, `-Infinity`는 `RangeError`.
 * `duration < 0`은 역방향 closed-form evaluation으로 허용한다.
 * overflow로 결과가 non-finite면 `RangeError`. `-0` 결과는 `0`으로 반환한다.
 *
 * @param angularVelocity 상수 angular velocity (radian/time)
 * @param duration 경과 시간 t. 음수는 역방향 평가다.
 */
export function angularDisplacement(angularVelocity: number, duration: number): number {
  assertFiniteScalar(angularVelocity, 'angularVelocity');
  assertFiniteScalar(duration, 'duration');

  return finalizeScalarResult(angularVelocity * duration, 'angularDisplacement');
}
