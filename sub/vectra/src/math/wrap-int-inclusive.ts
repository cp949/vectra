import {
  assertOrderedRange,
  assertSafeIntegers,
  positiveModulo,
  safeIntegerDifference,
  safeIntegerModuloSpan,
} from './range.internal';

/**
 * 정수 value를 closed range [min, max]로 감싼다.
 *
 * 모든 인자는 safe integer여야 한다. `min > max`이면 RangeError를 던진다.
 * `min === max`는 유효하며 `min`을 반환한다.
 * `max - min + 1`과 `value - min`도 safe integer로 표현 가능해야 한다.
 *
 * @param value 감쌀 정수 값
 * @param min closed range의 포함 하한
 * @param max closed range의 포함 상한
 */
export function wrapIntInclusive(value: number, min: number, max: number): number {
  assertSafeIntegers([value, min, max]);
  assertOrderedRange(min, max);

  if (min === max) {
    return min;
  }

  const span = safeIntegerModuloSpan(min, max, true);
  const offset = safeIntegerDifference(value, min);

  return min + positiveModulo(offset, span);
}
