import { positiveModulo } from '../math/range.internal';

const TWO_PI = Math.PI * 2;

/**
 * 두 angle의 shortest signed delta를 radian으로 반환한다. 결과는 half-open `[-π, π)`이다.
 *
 * `to - from`을 `[-π, π)`로 감싸므로 antipodal tie(`Math.PI`)는 `-Math.PI`로 감긴다. angle
 * domain의 `angleDelta`와 동작이 같지만, motion leaf가 angle public leaf를 helper 목적으로
 * import하지 않도록 낮은 internal primitive로 둔다. 호출자가 `from`, `to`의 finite 검증을
 * 책임진다.
 *
 * @param from 기준 angle (radian)
 * @param to 목표 angle (radian)
 */
export function shortestAngleDelta(from: number, to: number): number {
  // wrapFloatHalfOpen(to - from, -π, π)와 동일한 half-open wrap. positiveModulo가 -0을 0으로
  // 정규화하므로 결과 부호도 canonical하다.
  return -Math.PI + positiveModulo(to - from + Math.PI, TWO_PI);
}

/**
 * scalar kinematics 입력이 finite number인지 검증한다. 위반 시 `RangeError`.
 *
 * `NaN`, `Infinity`, `-Infinity`는 모두 위반이다. 음수와 `0`은 허용한다. 음수 time은 역방향
 * closed-form evaluation 입력이다.
 *
 * @param value 검증할 입력 scalar
 * @param name error message에 사용할 인자 이름
 */
export function assertFiniteScalar(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be a finite number, got ${String(value)}`);
  }
}

/**
 * scalar kinematics 계산 결과를 마감한다. 결과가 finite하지 않으면 `RangeError`, `-0`이면 `0`을
 * 반환한다.
 *
 * 모든 입력이 finite하게 검증된 뒤에도 곱셈/덧셈 overflow로 결과가 `Infinity`, `-Infinity`가 될 수
 * 있다. 중간 항이 양/음 `Infinity`로 갈리면 `Infinity + (-Infinity)`로 결과가 `NaN`이 되기도 한다.
 * `Number.isFinite`는 `NaN`도 거부하므로 두 경우 모두 같은 `RangeError`로 마감한다.
 *
 * @param result 검증하고 canonicalize할 계산 결과
 * @param name error message에 사용할 결과 이름
 */
export function finalizeScalarResult(result: number, name: string): number {
  if (!Number.isFinite(result)) {
    throw new RangeError(`${name} must be a finite number, got ${String(result)}`);
  }

  // -0 결과를 +0으로 canonicalize한다. `-0 === 0`이므로 0 리터럴로 대체된다.
  return result === 0 ? 0 : result;
}

/**
 * scalar 입력이 finite하고 0보다 큰지 검증한다. 위반 시 `RangeError`.
 *
 * deceleration magnitude나 speed처럼 0과 음수를 모두 거부해야 하는 입력에 사용한다.
 *
 * @param value 검증할 입력 scalar
 * @param name error message에 사용할 인자 이름
 */
export function assertPositiveScalar(value: number, name: string): void {
  assertFiniteScalar(value, name);
  if (value <= 0) {
    throw new RangeError(`${name} must be a positive finite number, got ${String(value)}`);
  }
}

/**
 * scalar 입력이 finite하고 음수가 아닌지 검증한다. 위반 시 `RangeError`. `0`은 허용한다.
 *
 * distance, max speed, elapsed time처럼 음수를 거부하되 `0`은 허용해야 하는 입력에 사용한다.
 *
 * @param value 검증할 입력 scalar
 * @param name error message에 사용할 인자 이름
 */
export function assertNonNegativeScalar(value: number, name: string): void {
  assertFiniteScalar(value, name);
  if (value < 0) {
    throw new RangeError(`${name} must be a non-negative finite number, got ${String(value)}`);
  }
}
