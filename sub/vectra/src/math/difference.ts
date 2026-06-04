import { assertFiniteNumbers } from './range.internal';

/**
 * 두 scalar 값 사이의 절대 차이를 반환한다.
 *
 * 두 인자는 모두 finite number여야 한다.
 *
 * @param a 차이를 측정할 첫 번째 값
 * @param b 차이를 측정할 두 번째 값
 */
export function difference(a: number, b: number): number {
  assertFiniteNumbers([a, b]);

  return Math.abs(a - b);
}
