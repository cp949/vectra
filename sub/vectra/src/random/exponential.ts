import { type RandomSource, random } from './random';

/**
 * 지수 분포 난수를 반환한다.
 *
 * inverse CDF 방법을 사용한다: `-Math.log(1 - random(rng)) * scale`.
 * `scale`은 분포의 평균값과 같다 (rate parameter의 역수).
 *
 * @param scale - 분포의 scale parameter (평균). `scale > 0`인 finite number여야 한다.
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 * @throws {RangeError} scale이 finite number가 아니거나 0 이하일 때.
 */
export const exponential = (scale: number, rng?: RandomSource): number => {
  if (!Number.isFinite(scale) || scale <= 0) {
    throw new RangeError(`exponential: scale은 0보다 큰 finite number여야 한다. 받은 값: ${scale}`);
  }
  return -Math.log(Math.max(1 - random(rng), Number.MIN_VALUE)) * scale;
};
