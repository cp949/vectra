import { assertFiniteScalar, finalizeScalarResult } from './scalar.internal';

/**
 * 변위와 상수 가속도, 경과 시간에서 시작 속도를 반환한다. 수식은
 * `(displacement - 0.5 * acceleration * time * time) / time`이다.
 *
 * 모든 입력은 finite number여야 한다. `NaN`, `Infinity`, `-Infinity`는 `RangeError`.
 * `time < 0`은 역방향 closed-form evaluation으로 허용한다.
 * `time === 0`은 시작 속도가 non-unique이므로 `undefined`를 반환한다.
 * overflow로 결과가 non-finite면 `RangeError`. `-0` 결과는 `0`으로 반환한다.
 *
 * @param displacement 구간 변위 d
 * @param acceleration 상수 가속도 a
 * @param time 경과 시간 t. 음수는 역방향 평가다.
 */
export function initialVelocityFromDisplacement(
  displacement: number,
  acceleration: number,
  time: number
): number | undefined {
  assertFiniteScalar(displacement, 'displacement');
  assertFiniteScalar(acceleration, 'acceleration');
  assertFiniteScalar(time, 'time');

  if (time === 0) {
    return undefined;
  }

  return finalizeScalarResult(
    (displacement - 0.5 * acceleration * time * time) / time,
    'initialVelocityFromDisplacement'
  );
}
