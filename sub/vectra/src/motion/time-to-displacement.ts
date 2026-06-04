import { assertFiniteScalar, finalizeScalarResult } from './scalar.internal';

/**
 * 시작 속도와 상수 가속도에서 목표 변위에 도달하는 가장 이른 시간을 반환한다.
 * `0.5 * acceleration * t * t + initialVelocity * t - displacement = 0`의 가장 작은 non-negative
 * finite root다.
 *
 * 모든 입력은 finite number여야 한다. `NaN`, `Infinity`, `-Infinity`는 `RangeError`.
 * `displacement === 0`이면 earliest solution `0`을 반환한다.
 * non-negative root가 없거나 discriminant가 음수면 도달 불가이므로 `undefined`.
 * 중간 discriminant나 선택된 root가 overflow로 non-finite가 되면 `RangeError`. `-0` 결과는 `0`으로 반환한다.
 *
 * @param initialVelocity 시작 속도 v0
 * @param acceleration 상수 가속도 a
 * @param displacement 목표 변위 d
 */
export function timeToDisplacement(
  initialVelocity: number,
  acceleration: number,
  displacement: number
): number | undefined {
  assertFiniteScalar(initialVelocity, 'initialVelocity');
  assertFiniteScalar(acceleration, 'acceleration');
  assertFiniteScalar(displacement, 'displacement');

  if (displacement === 0) {
    return 0;
  }

  if (acceleration === 0) {
    // 등속 선형 해: v0 * t = d. v0 === 0이면 변위가 불가능하다.
    if (initialVelocity === 0) {
      return undefined;
    }

    const linearTime = displacement / initialVelocity;

    return linearTime < 0 ? undefined : finalizeScalarResult(linearTime, 'timeToDisplacement');
  }

  // 2차 해: discriminant = v0^2 + 2 * a * d. 중간 overflow로 비유한값이 되면 RangeError로 마감한다.
  // v0^2가 +Infinity, 2 * a * d가 -Infinity로 갈리면 합이 NaN이 되므로 음수 판정 전에 검사한다.
  const discriminant = initialVelocity * initialVelocity + 2 * acceleration * displacement;

  if (!Number.isFinite(discriminant)) {
    throw new RangeError(`timeToDisplacement discriminant must be a finite number, got ${String(discriminant)}`);
  }

  if (discriminant < 0) {
    return undefined;
  }

  const sqrtDiscriminant = Math.sqrt(discriminant);
  // 수치 안정 quadratic. 작은 root를 `-v0 ± sqrt(disc)`로 직접 빼면 두 항이 크기가 비슷할 때
  // catastrophic cancellation으로 정밀도가 무너진다. well-conditioned root 하나를 q로 구하고
  // 나머지는 곱으로 유도한다. v0 === 0이면 cancellation이 없으므로 직접 계산한다.
  let roots: readonly [number, number];
  if (initialVelocity === 0) {
    const root = sqrtDiscriminant / acceleration;
    roots = [root, -root];
  } else {
    const q = -0.5 * (initialVelocity + Math.sign(initialVelocity) * sqrtDiscriminant);
    // 표준형 0.5 * a * t^2 + v0 * t - d = 0에서 root1 = q / (0.5 * a), root2 = (-d) / q.
    roots = [(2 * q) / acceleration, -displacement / q];
  }

  let earliest: number | undefined;
  for (const root of roots) {
    if (root >= 0 && (earliest === undefined || root < earliest)) {
      earliest = root;
    }
  }

  return earliest === undefined ? undefined : finalizeScalarResult(earliest, 'timeToDisplacement');
}
