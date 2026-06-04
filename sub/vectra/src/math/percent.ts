import { assertFiniteNumbers, assertNonZeroOrderedRange } from './range.internal';

/**
 * ordered range [min, max]에서 value가 차지하는 비율을 반환한다.
 *
 * 모든 인자는 finite number여야 한다. `min >= max`이면 RangeError를 던진다.
 * 반환값은 clamp하지 않는다.
 *
 * @param value 비율로 변환할 scalar 값
 * @param min source range의 하한
 * @param max source range의 상한
 */
export function percent(value: number, min: number, max: number): number {
  assertFiniteNumbers([value, min, max]);
  assertNonZeroOrderedRange(min, max);

  return (value - min) / (max - min);
}
