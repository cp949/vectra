/**
 * 두 정수의 최대공약수를 반환한다.
 *
 * 유클리드 알고리즘을 사용한다. 입력은 safe integer여야 한다. 비정수이면 RangeError를 던진다.
 * gcd(0, 0) = 0. gcd(a, 0) = |a|. gcd(0, b) = |b|.
 *
 * @param a 첫 번째 정수
 * @param b 두 번째 정수
 */
export function gcd(a: number, b: number): number {
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b)) {
    throw new RangeError('gcd arguments must be safe integers');
  }

  let x = Math.abs(a);
  let y = Math.abs(b);

  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }

  return x;
}
