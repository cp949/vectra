import { assertFiniteNumbers, assertNonNegativeFiniteNumber } from './range.internal';

/**
 * 두 scalar 값이 scale-adaptive tolerance 기준으로 근사하게 같은지 반환한다.
 *
 * `Math.abs(a - b) <= epsilon * (1 + scale * (Math.abs(a) + Math.abs(b)))`로 판정한다.
 * 모든 인자는 finite number여야 한다. epsilon과 scale은 0 이상이어야 한다.
 *
 * @param a 비교할 첫 번째 값
 * @param b 비교할 두 번째 값
 * @param epsilon 절대 tolerance 기준. 기본값 1e-10
 * @param scale scale adaptive factor. 기본값 0.5
 */
export function fuzzyEqualScaled(a: number, b: number, epsilon = 1e-10, scale = 0.5): boolean {
  assertFiniteNumbers([a, b]);
  assertNonNegativeFiniteNumber(epsilon);
  assertNonNegativeFiniteNumber(scale);

  return Math.abs(a - b) <= epsilon * (1 + scale * (Math.abs(a) + Math.abs(b)));
}
