import { assertFiniteNumbers, assertPositiveDuration, lerpRaw } from './interpolation.internal';

/**
 * raw 경과 시간 진행 비율로 a와 b 사이를 보간한다.
 *
 * progress는 raw `elapsed / duration`이며 clamp하지 않는다.
 * `elapsed < 0`과 `elapsed > duration` 모두 extrapolation을 허용한다.
 * `a`, `b`, `elapsed`는 finite number여야 한다.
 * `duration`은 finite number이고 `duration > 0`이어야 한다. 그렇지 않으면 RangeError.
 *
 * @param a `elapsed === 0`일 때의 값
 * @param b `elapsed === duration`일 때의 값
 * @param elapsed 경과 시간
 * @param duration 전체 구간 길이. finite이고 `> 0`이어야 한다
 */
export function lerpByElapsed(a: number, b: number, elapsed: number, duration: number): number {
  assertFiniteNumbers([a, b, elapsed]);
  assertPositiveDuration(duration);

  return lerpRaw(a, b, elapsed / duration);
}
