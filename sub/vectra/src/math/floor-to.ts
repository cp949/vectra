import { assertFiniteNumbers, roundingFactor } from './range.internal';

/**
 * value를 base ** place 정밀도에 맞춰 내림한다.
 *
 * 모든 인자는 finite number여야 한다. `place > 0`은 소수 방향, `place < 0`은 정수 자리 방향
 * 정밀도를 뜻한다. `place`는 safe integer여야 하고, `base`는 0보다 크며 1이 아니어야 한다.
 * 계산된 scale factor가 finite positive number가 아니면 RangeError를 던진다.
 *
 * @param value 내림할 값
 * @param place `base ** place`로 해석할 자리수
 * @param base 정밀도 scale의 밑
 */
export function floorTo(value: number, place: number, base = 10): number {
  assertFiniteNumbers([value]);
  const factor = roundingFactor(place, base);

  return Math.floor(value * factor) / factor;
}
