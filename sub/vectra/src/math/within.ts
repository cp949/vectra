import { assertFiniteNumbers, assertOrderedRange } from './range.internal';

/**
 * value가 ordered closed range [min, max] 안에 있으면 true를 반환한다.
 *
 * 모든 인자는 finite number여야 한다. `min > max`이면 RangeError를 던진다.
 * `min === max`에서는 `value === min`일 때만 true를 반환한다.
 *
 * @param value 포함 여부를 확인할 scalar 값
 * @param min closed range의 하한
 * @param max closed range의 상한
 */
export function within(value: number, min: number, max: number): boolean {
  assertFiniteNumbers([value, min, max]);
  assertOrderedRange(min, max);

  return value >= min && value <= max;
}
