import { gcd } from './gcd';

/**
 * 두 정수의 최소공배수를 반환한다.
 *
 * `|a * b| / gcd(a, b)`로 계산한다. 입력은 safe integer여야 한다. 비정수이면 RangeError를 던진다.
 * a 또는 b가 0이면 0을 반환한다.
 *
 * @param a 첫 번째 정수
 * @param b 두 번째 정수
 */
export function lcm(a: number, b: number): number {
  // gcd 안에서 isSafeInteger 검증이 수행된다
  const g = gcd(a, b);
  if (g === 0) return 0;

  return Math.abs((a / g) * b);
}
