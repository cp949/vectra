import { assertFiniteNumbers, assertNonZeroOrderedRange } from './range.internal';

/**
 * ordered source range [a, b]에서 value가 차지하는 비율을 반환한다.
 *
 * 모든 인자는 finite number여야 한다. `a >= b`이면 RangeError를 던진다.
 * 반환값은 clamp하지 않으므로 source range 밖의 value는 0보다 작거나 1보다 클 수 있다.
 *
 * @param a source range의 시작값
 * @param b source range의 끝값
 * @param value 비율로 변환할 scalar 값
 */
export function inverseLerp(a: number, b: number, value: number): number {
  assertFiniteNumbers([a, b, value]);
  assertNonZeroOrderedRange(a, b);

  return (value - a) / (b - a);
}
