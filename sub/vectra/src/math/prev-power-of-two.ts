/**
 * value보다 작거나 같은 가장 큰 2의 거듭제곱을 반환한다.
 *
 * value가 이미 2의 거듭제곱이면 그 값을 반환한다.
 * value는 1 이상의 safe integer여야 한다. 범위 밖이면 RangeError를 던진다.
 *
 * @param value 기준 정수 값
 */
export function prevPowerOfTwo(value: number): number {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new RangeError('prevPowerOfTwo argument must be a safe integer >= 1');
  }

  let p = 1;
  while (p * 2 <= value) p *= 2;
  return p;
}
