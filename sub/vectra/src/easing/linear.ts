import { assertFiniteT } from './easing.internal';

/**
 * t를 그대로 반환하는 identity easing 함수다.
 *
 * t는 finite number여야 한다. NaN/±Infinity는 RangeError를 던진다.
 * clamp하지 않는다.
 *
 * @param t easing progress (보통 [0, 1])
 */
export function linear(t: number): number {
  assertFiniteT(t);
  return t;
}
