import {
  assertFiniteScalar,
  assertNonNegativeScalar,
  finalizeScalarResult,
  shortestAngleDelta,
} from './scalar.internal';

/**
 * angle scalar를 `maxAngularSpeed * elapsed`만큼 target 방향으로 이동한 angle을 반환한다.
 *
 * angle은 radian이며 이동 방향은 shortest path half-open `[-π, π)` delta를 따른다. antipodal
 * tie(`Math.PI`)는 `-Math.PI`로 감기므로 `moveTowardAngleByElapsed(0, Math.PI, s, t)`는 음의
 * 방향으로 이동한다.
 * `current`, `target`은 finite number여야 한다. `NaN`, `Infinity`, `-Infinity`는 `RangeError`.
 * `maxAngularSpeed`, `elapsed`는 음수가 아닌 finite number여야 한다. 음수나 non-finite는 `RangeError`.
 * 이동 step `maxAngularSpeed * elapsed`가 overflow하면 `RangeError`.
 * `delta = angleDelta(current, target)`이고 `Math.abs(delta) <= step`이면 caller가 전달한 `target`을
 * 그대로 반환한다. 결과를 별도 normalize하지 않는다.
 * step이 부족하면 `current + Math.sign(delta) * step`을 반환한다.
 * `-0` 결과는 `0`으로 반환한다.
 *
 * @param current 현재 angle (radian)
 * @param target 목표 angle (radian)
 * @param maxAngularSpeed 음수가 아닌 최대 angular speed (radian/time)
 * @param elapsed 음수가 아닌 경과 시간
 */
export function moveTowardAngleByElapsed(
  current: number,
  target: number,
  maxAngularSpeed: number,
  elapsed: number
): number {
  assertFiniteScalar(current, 'current');
  assertFiniteScalar(target, 'target');
  assertNonNegativeScalar(maxAngularSpeed, 'maxAngularSpeed');
  assertNonNegativeScalar(elapsed, 'elapsed');

  const delta = shortestAngleDelta(current, target);
  // overflow한 step은 finite 검증에서 RangeError로 마감한다.
  const step = finalizeScalarResult(maxAngularSpeed * elapsed, 'step');

  if (Math.abs(delta) <= step) {
    return finalizeScalarResult(target, 'value');
  }

  return finalizeScalarResult(current + Math.sign(delta) * step, 'value');
}
