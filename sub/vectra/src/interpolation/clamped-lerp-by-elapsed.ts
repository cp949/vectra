import { assertFiniteNumbers, assertPositiveDuration, clampScalar, lerpRaw } from './interpolation.internal';

/**
 * 경과 시간 진행 비율을 `[0, 1]`로 clamp한 뒤 a와 b 사이를 보간한다.
 *
 * progress는 `clamp(elapsed / duration, 0, 1)`이다. t-clamp가 아니라 elapsed progress clamp다.
 * `elapsed < 0`이면 a, `elapsed > duration`이면 b를 반환한다. `a > b`에서도 endpoint 정책은 동일하다.
 * `a`, `b`, `elapsed`는 finite number여야 한다.
 * `duration`은 finite number이고 `duration > 0`이어야 한다. 그렇지 않으면 RangeError.
 *
 * @param a `elapsed <= 0`일 때의 값
 * @param b `elapsed >= duration`일 때의 값
 * @param elapsed 경과 시간
 * @param duration 전체 구간 길이. finite이고 `> 0`이어야 한다
 */
export function clampedLerpByElapsed(a: number, b: number, elapsed: number, duration: number): number {
  assertFiniteNumbers([a, b, elapsed]);
  assertPositiveDuration(duration);

  // elapsed progress를 [0, 1]로 clamp한 뒤 lerp한다
  const progress = clampScalar(elapsed / duration, 0, 1);

  return lerpRaw(a, b, progress);
}
