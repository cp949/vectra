import {
  assertSafeIntegers,
  assertStrictOrderedRange,
  positiveModulo,
  safeIntegerDifference,
  safeIntegerModuloSpan,
} from './range.internal';

/**
 * 정수 value를 half-open range [min, max)로 감싼다.
 *
 * 모든 인자는 safe integer여야 한다. `min >= max`이면 RangeError를 던진다.
 * `max - min`과 `value - min`도 safe integer로 표현 가능해야 한다.
 *
 * @param value 감쌀 정수 값
 * @param min half-open range의 포함 하한
 * @param max half-open range의 제외 상한
 */
export function wrapIntHalfOpen(value: number, min: number, max: number): number {
  assertSafeIntegers([value, min, max]);
  assertStrictOrderedRange(min, max);

  const span = safeIntegerModuloSpan(min, max, false);
  const offset = safeIntegerDifference(value, min);

  return min + positiveModulo(offset, span);
}
