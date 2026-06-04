import { randomUint32Below } from './entropy.internal';
import { type RandomSource, random } from './random';

/**
 * `[min, max]` 범위의 정수 난수를 반환한다 (양 끝 포함).
 *
 * `rng`가 없으면 Web Crypto 기반 rejection sampling으로 modulo bias를 피한다.
 * `rng`가 주어지면 해당 함수의 반환값을 이용한 truncation으로 정수를 계산한다.
 *
 * degenerate 입력 처리:
 * - `min > max`이면 RangeError를 던진다.
 * - `min`이나 `max`가 안전 정수가 아니면 RangeError를 던진다.
 * - `max - min + 1`이 2^32를 초과하면 RangeError를 던진다.
 *
 * @param min - 범위의 하한값 (inclusive). 안전 정수여야 한다.
 * @param max - 범위의 상한값 (inclusive). 안전 정수여야 하며 `min` 이상이어야 한다.
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 * @throws {RangeError} 입력이 유효하지 않으면 던진다.
 */
export const int = (min: number, max: number, rng?: RandomSource): number => {
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || max < min) {
    throw new RangeError('min and max must define a valid inclusive safe-integer range up to 2^32 values');
  }
  const range = max - min + 1;
  if (range > 0x100000000) {
    throw new RangeError('min and max must define a valid inclusive safe-integer range up to 2^32 values');
  }

  if (rng === undefined) {
    return min + randomUint32Below(range);
  }

  return Math.floor(random(rng) * range) + min;
};
