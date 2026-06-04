import { assertFiniteScalar, finalizeScalarResult } from './scalar.internal';

/**
 * 상수 가속도에서 경과 시간 후 속도를 반환한다. 수식은 `initialVelocity + acceleration * time`이다.
 *
 * 모든 입력은 finite number여야 한다. `NaN`, `Infinity`, `-Infinity`는 `RangeError`.
 * `time < 0`은 역방향 closed-form evaluation으로 허용한다.
 * overflow로 결과가 non-finite면 `RangeError`. `-0` 결과는 `0`으로 반환한다.
 *
 * @param initialVelocity 초기 속도 v0
 * @param acceleration 상수 가속도 a
 * @param time 경과 시간 t. 음수는 역방향 평가다.
 */
export function finalVelocity(initialVelocity: number, acceleration: number, time: number): number {
  assertFiniteScalar(initialVelocity, 'initialVelocity');
  assertFiniteScalar(acceleration, 'acceleration');
  assertFiniteScalar(time, 'time');

  return finalizeScalarResult(initialVelocity + acceleration * time, 'finalVelocity');
}
