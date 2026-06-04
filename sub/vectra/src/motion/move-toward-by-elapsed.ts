import { assertFiniteScalar, assertNonNegativeScalar, finalizeScalarResult } from './scalar.internal';

/**
 * scalar `moveTowardByElapsed` 결과. 이동 후 위치와 target 도달 여부를 담는다.
 */
export interface MoveTowardResult {
  /** 이동 후 scalar 위치. `-0`은 `0`으로 canonicalize된다. */
  readonly value: number;

  /** 이번 이동으로 target에 도달했으면 `true` */
  readonly reached: boolean;
}

/**
 * scalar 위치를 `maxSpeed * elapsed`만큼 target 방향으로 이동한 결과를 반환한다.
 *
 * `current`, `target`은 finite number여야 한다. `NaN`, `Infinity`, `-Infinity`는 `RangeError`.
 * `maxSpeed`, `elapsed`는 음수가 아닌 finite number여야 한다. 음수나 non-finite는 `RangeError`.
 * 이동 step `maxSpeed * elapsed`가 overflow하면 `RangeError`.
 * 이동 step이 `Math.abs(target - current)` 이상이면 target으로 clamp하고 `reached: true`를 반환한다.
 * `current === target`이면 거리가 0이므로 `{ value: target, reached: true }`.
 * overshoot하지 않으면 `{ value: current + sign(target - current) * step, reached: false }`.
 * `value`의 `-0`은 `0`으로 canonicalize한다.
 *
 * @param current 시작 scalar 위치
 * @param target 목표 scalar 위치
 * @param maxSpeed 음수가 아닌 최대 속력
 * @param elapsed 음수가 아닌 경과 시간
 */
export function moveTowardByElapsed(
  current: number,
  target: number,
  maxSpeed: number,
  elapsed: number
): MoveTowardResult {
  assertFiniteScalar(current, 'current');
  assertFiniteScalar(target, 'target');
  assertNonNegativeScalar(maxSpeed, 'maxSpeed');
  assertNonNegativeScalar(elapsed, 'elapsed');

  const delta = target - current;
  const distance = Math.abs(delta);
  // overflow한 step은 finite 검증에서 RangeError로 마감한다.
  const step = finalizeScalarResult(maxSpeed * elapsed, 'step');

  if (step >= distance) {
    return { value: finalizeScalarResult(target, 'value'), reached: true };
  }

  return { value: finalizeScalarResult(current + Math.sign(delta) * step, 'value'), reached: false };
}
