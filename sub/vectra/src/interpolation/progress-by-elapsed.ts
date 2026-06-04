import { assertFiniteNumbers, assertPositiveDuration, clampScalar } from './interpolation.internal';

/**
 * 경과 시간 대비 진행 비율을 `[0, 1]`로 clamp해 반환한다.
 *
 * `clamp(elapsed / duration, 0, 1)`을 계산한다.
 * `elapsed < 0`은 `0`, `elapsed > duration`은 `1`로 고정한다.
 * `elapsed`는 finite number여야 한다.
 * `duration`은 finite number이고 `duration > 0`이어야 한다. 그렇지 않으면 RangeError.
 *
 * @param elapsed 경과 시간
 * @param duration 전체 구간 길이. finite이고 `> 0`이어야 한다
 */
export function progressByElapsed(elapsed: number, duration: number): number {
  assertFiniteNumbers([elapsed]);
  assertPositiveDuration(duration);

  return clampScalar(elapsed / duration, 0, 1);
}
