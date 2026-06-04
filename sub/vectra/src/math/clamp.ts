import { assertFiniteNumbers, assertOrderedRange } from './range.internal';

/**
 * value를 ordered closed range [min, max]로 제한한다.
 *
 * 모든 인자는 finite number여야 한다. `min > max`이면 RangeError를 던진다.
 * `min === max`는 유효하며 `min`을 반환한다.
 *
 * @param value 제한할 scalar 값
 * @param min closed range의 하한
 * @param max closed range의 상한
 */
export function clamp(value: number, min: number, max: number): number {
  assertFiniteNumbers([value, min, max]);
  assertOrderedRange(min, max);

  return Math.min(Math.max(value, min), max);
}
