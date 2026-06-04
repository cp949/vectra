import { assertFiniteScalar, assertPositiveScalar, finalizeScalarResult } from './scalar.internal';

/**
 * 상수 감속도에서 정지까지의 이동 거리를 반환한다. 수식은
 * `initialVelocity * initialVelocity / (2 * deceleration)`이다.
 *
 * `initialVelocity`는 finite number여야 한다. `NaN`, `Infinity`, `-Infinity`는 `RangeError`.
 * `deceleration`은 양수 magnitude다. `0` 이하나 non-finite는 `RangeError`.
 * `initialVelocity`의 부호는 결과에 영향을 주지 않는다(제곱 거리).
 * overflow로 결과가 non-finite면 `RangeError`. `-0` 결과는 `0`으로 반환한다.
 *
 * @param initialVelocity 시작 속도 v0. 부호 무관.
 * @param deceleration 양수 감속도 magnitude
 */
export function stopDistance(initialVelocity: number, deceleration: number): number {
  assertFiniteScalar(initialVelocity, 'initialVelocity');
  assertPositiveScalar(deceleration, 'deceleration');

  return finalizeScalarResult((initialVelocity * initialVelocity) / (2 * deceleration), 'stopDistance');
}
