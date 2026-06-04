import { assertFiniteNumbers } from './range.internal';

/**
 * 두 값의 sign bit가 같으면 true를 반환한다.
 *
 * 모든 인자는 finite number여야 한다. 양수와 `+0`은 같은 sign, 음수와 `-0`은 같은 sign이다.
 * `+0`과 `-0`은 서로 다른 sign으로 본다.
 *
 * @param a 비교할 첫째 scalar 값
 * @param b 비교할 둘째 scalar 값
 */
export function isSameSign(a: number, b: number): boolean {
  assertFiniteNumbers([a, b]);

  const aNegative = a < 0 || Object.is(a, -0);
  const bNegative = b < 0 || Object.is(b, -0);

  return aNegative === bNegative;
}
