/**
 * value보다 크거나 같은 가장 작은 2의 거듭제곱을 반환한다.
 *
 * value가 이미 2의 거듭제곱이면 그 값을 반환한다.
 * value <= 1이면 1을 반환한다.
 * value는 1 이상 2^52 이하의 safe integer여야 한다. 범위 밖이면 RangeError를 던진다.
 *
 * @param value 기준 정수 값
 */
export function nextPowerOfTwo(value: number): number {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new RangeError('nextPowerOfTwo argument must be a safe integer >= 1');
  }

  if (value > 2 ** 52) {
    throw new RangeError('nextPowerOfTwo argument too large');
  }

  let p = 1;
  while (p < value) p *= 2;
  return p;
}
