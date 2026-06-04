import { DEFAULT_EPSILON } from '../internal/numeric';
import { assertFiniteNumbers, assertNonNegativeFiniteNumber } from './range.internal';

/**
 * a가 b - epsilon보다 크면 true를 반환한다.
 *
 * 모든 인자는 finite number여야 한다. `epsilon`은 0 이상이어야 하며,
 * `epsilon = 0`이면 strict greater-than과 같다.
 *
 * @param a 왼쪽 비교값
 * @param b 오른쪽 비교값
 * @param epsilon 덜 엄격한 greater-than 비교에 허용할 절대 오차
 */
export function fuzzyGreaterThan(a: number, b: number, epsilon = DEFAULT_EPSILON): boolean {
  assertFiniteNumbers([a, b]);
  assertNonNegativeFiniteNumber(epsilon);

  return a > b - epsilon;
}
