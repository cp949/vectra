import { DEFAULT_EPSILON } from '../internal/numeric';
import { assertFiniteNumbers, assertNonNegativeFiniteNumber } from './range.internal';

/**
 * 두 scalar 값의 절대 차이가 epsilon 이하이면 true를 반환한다.
 *
 * 모든 인자는 finite number여야 한다. `epsilon`은 inclusive absolute tolerance이며 0 이상이어야 한다.
 * 기본값은 DEFAULT_EPSILON이다.
 *
 * @param a 비교할 첫 번째 값
 * @param b 비교할 두 번째 값
 * @param epsilon 허용할 절대 오차
 */
export function fuzzyEqual(a: number, b: number, epsilon = DEFAULT_EPSILON): boolean {
  assertFiniteNumbers([a, b]);
  assertNonNegativeFiniteNumber(epsilon);

  return Math.abs(a - b) <= epsilon;
}
