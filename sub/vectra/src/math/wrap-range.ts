import { periodicPhase } from './periodic.internal';
import { assertFiniteNumbers, assertStrictOrderedRange } from './range.internal';

/**
 * value를 half-open range [min, max)로 wrap한 결과를 반환한다.
 *
 * 모든 인자는 finite number여야 한다. `min >= max`이면 RangeError를 던진다.
 * positive modulo 정책을 사용하므로 음수 phase도 양수 phase로 보정한다.
 * `wrapFloatHalfOpen(value, min, max)`과 동일한 의미의 user-facing alias이다.
 *
 * @param value wrap할 scalar 값
 * @param min half-open range의 포함 하한
 * @param max half-open range의 제외 상한
 */
export function wrapRange(value: number, min: number, max: number): number {
  assertFiniteNumbers([value, min, max]);
  assertStrictOrderedRange(min, max);

  return min + periodicPhase(value - min, max - min);
}
