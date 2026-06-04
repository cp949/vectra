import { assertFiniteScalar, finalizeScalarResult } from './scalar.internal';

/**
 * endpoint velocity 평균으로 변위를 반환한다. 수식은 `(initialVelocity + finalVelocity) * 0.5 * time`이다.
 *
 * 두 endpoint velocity의 평균 속도에 time을 곱한다. endpoint velocity는 half-scale sum으로 평균해
 * 불필요한 합산 overflow를 피한다. acceleration을 추론하거나 상수 가속도 일관성을 검사하지 않는다.
 * 모든 입력은 finite number여야 한다. `NaN`, `Infinity`, `-Infinity`는 `RangeError`.
 * `time < 0`은 역방향 closed-form evaluation으로 허용한다.
 * overflow로 결과가 non-finite면 `RangeError`. `-0` 결과는 `0`으로 반환한다.
 *
 * @param initialVelocity 구간 시작 속도 v0
 * @param finalVelocity 구간 끝 속도 v1
 * @param time 경과 시간 t. 음수는 역방향 평가다.
 */
export function displacementFromVelocities(initialVelocity: number, finalVelocity: number, time: number): number {
  assertFiniteScalar(initialVelocity, 'initialVelocity');
  assertFiniteScalar(finalVelocity, 'finalVelocity');
  assertFiniteScalar(time, 'time');

  const averageVelocity = initialVelocity * 0.5 + finalVelocity * 0.5;

  return finalizeScalarResult(averageVelocity * time, 'displacementFromVelocities');
}
