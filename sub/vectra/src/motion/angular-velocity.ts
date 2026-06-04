import { assertFiniteScalar, finalizeScalarResult, shortestAngleDelta } from './scalar.internal';

/**
 * 두 angle 사이의 평균 angular velocity를 반환한다. 수식은 `angleDelta(fromAngle, toAngle) / duration`이다.
 *
 * angle은 radian이며 angle delta는 shortest path half-open `[-π, π)`로 계산한다. antipodal
 * tie(`Math.PI`)는 `-Math.PI`로 감기므로 `angularVelocity(0, Math.PI, t)`는 음의 방향이다.
 * `fromAngle`, `toAngle`, `duration`은 finite number여야 한다. `NaN`, `Infinity`, `-Infinity`는 `RangeError`.
 * `duration === 0`은 angular velocity가 non-unique이므로 `undefined`를 반환한다.
 * `duration < 0`은 역방향 closed-form evaluation으로 허용한다.
 * overflow로 결과가 non-finite면 `RangeError`. `-0` 결과는 `0`으로 반환한다.
 *
 * @param fromAngle 구간 시작 angle (radian)
 * @param toAngle 구간 끝 angle (radian)
 * @param duration 경과 시간 t. 음수는 역방향 평가다.
 */
export function angularVelocity(fromAngle: number, toAngle: number, duration: number): number | undefined {
  assertFiniteScalar(fromAngle, 'fromAngle');
  assertFiniteScalar(toAngle, 'toAngle');
  assertFiniteScalar(duration, 'duration');

  if (duration === 0) {
    return undefined;
  }

  return finalizeScalarResult(shortestAngleDelta(fromAngle, toAngle) / duration, 'angularVelocity');
}
