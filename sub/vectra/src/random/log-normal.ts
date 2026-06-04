import { normal } from './normal';
import type { RandomSource } from './random';

/**
 * log-normal 분포 난수를 반환한다.
 *
 * `sigma === 0`이면 degenerate distribution으로 취급해 `Math.exp(mean)`을 반환한다.
 *
 * @param mean - underlying normal distribution의 평균. finite number여야 한다.
 * @param sigma - underlying normal distribution의 표준편차. `sigma >= 0`인 finite number여야 한다.
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 * @throws {RangeError} mean 또는 sigma가 유효 범위를 벗어날 때.
 */
export const logNormal = (mean: number, sigma: number, rng?: RandomSource): number => {
  if (!Number.isFinite(mean)) {
    throw new RangeError(`logNormal: mean은 finite number여야 한다. 받은 값: ${mean}`);
  }
  if (!Number.isFinite(sigma) || sigma < 0) {
    throw new RangeError(`logNormal: sigma는 0 이상의 finite number여야 한다. 받은 값: ${sigma}`);
  }
  return Math.exp(normal(mean, sigma, rng));
};
