import { assertFiniteNumbers, assertStrictOrderedRange, positiveModulo } from './range.internal';

/**
 * value를 half-open range [min, max)로 감싼다.
 *
 * 모든 인자는 finite number여야 한다. `min >= max`이면 RangeError를 던진다.
 * `value === max`는 `min`으로 감긴다.
 *
 * @param value 감쌀 scalar 값
 * @param min half-open range의 포함 하한
 * @param max half-open range의 제외 상한
 */
export function wrapFloatHalfOpen(value: number, min: number, max: number): number {
  assertFiniteNumbers([value, min, max]);
  assertStrictOrderedRange(min, max);

  return min + positiveModulo(value - min, max - min);
}
