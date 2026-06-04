import { type RandomSource, random } from './random';

/**
 * `[min, max)` 범위의 균등 분포 난수를 반환한다.
 *
 * @param min - 범위의 하한값 (inclusive). finite number여야 한다.
 * @param max - 범위의 상한값 (exclusive). finite number여야 한다.
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 * @throws {RangeError} min 또는 max가 finite number가 아닐 때.
 */
export const uniform = (min: number, max: number, rng?: RandomSource): number => {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new RangeError(`uniform: min과 max는 finite number여야 한다. 받은 값: min=${min}, max=${max}`);
  }
  return min + random(rng) * (max - min);
};
