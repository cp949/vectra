import { assertFiniteScalar, finalizeScalarResult } from './scalar.internal';

/**
 * 끝 속도와 상수 가속도, 경과 시간에서 시작 속도를 반환한다. 수식은 `finalVelocity - acceleration * time`이다.
 *
 * 모든 입력은 finite number여야 한다. `NaN`, `Infinity`, `-Infinity`는 `RangeError`.
 * `time < 0`은 역방향 closed-form evaluation으로 허용한다. `time === 0`은 finalVelocity를 그대로 반환한다.
 * overflow로 결과가 non-finite면 `RangeError`. `-0` 결과는 `0`으로 반환한다.
 *
 * @param finalVelocity 구간 끝 속도 v1
 * @param acceleration 상수 가속도 a
 * @param time 경과 시간 t. 음수는 역방향 평가다.
 */
export function initialVelocity(finalVelocity: number, acceleration: number, time: number): number {
  assertFiniteScalar(finalVelocity, 'finalVelocity');
  assertFiniteScalar(acceleration, 'acceleration');
  assertFiniteScalar(time, 'time');

  return finalizeScalarResult(finalVelocity - acceleration * time, 'initialVelocity');
}
