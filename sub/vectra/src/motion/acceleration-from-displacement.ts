import { assertFiniteScalar, finalizeScalarResult } from './scalar.internal';

/**
 * 시작 속도와 변위, 경과 시간에서 상수 가속도를 반환한다. 수식은
 * `2 * (displacement - initialVelocity * time) / (time * time)`이다.
 *
 * 모든 입력은 finite number여야 한다. `NaN`, `Infinity`, `-Infinity`는 `RangeError`.
 * `time < 0`은 역방향 closed-form evaluation으로 허용한다.
 * `time === 0`은 가속도가 non-unique이므로 `undefined`를 반환한다.
 * overflow로 결과가 non-finite면 `RangeError`. `-0` 결과는 `0`으로 반환한다.
 *
 * @param initialVelocity 구간 시작 속도 v0
 * @param displacement 구간 변위 d
 * @param time 경과 시간 t. 음수는 역방향 평가다.
 */
export function accelerationFromDisplacement(
  initialVelocity: number,
  displacement: number,
  time: number
): number | undefined {
  assertFiniteScalar(initialVelocity, 'initialVelocity');
  assertFiniteScalar(displacement, 'displacement');
  assertFiniteScalar(time, 'time');

  if (time === 0) {
    return undefined;
  }

  return finalizeScalarResult(
    (2 * (displacement - initialVelocity * time)) / (time * time),
    'accelerationFromDisplacement'
  );
}
