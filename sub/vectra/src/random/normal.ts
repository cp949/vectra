import type { RandomSource } from './random';
import { standardNormal } from './standard-normal';

/**
 * 정규 분포(가우시안 분포) 난수를 반환한다.
 *
 * `stddev = 0`이면 항상 `mean`을 반환한다.
 *
 * @param mean - 분포의 평균값. finite number여야 한다.
 * @param stddev - 분포의 표준편차. `stddev >= 0`인 finite number여야 한다.
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 * @throws {RangeError} mean이 finite number가 아닐 때.
 * @throws {RangeError} stddev가 finite number가 아니거나 음수일 때.
 */
export const normal = (mean: number, stddev: number, rng?: RandomSource): number => {
  if (!Number.isFinite(mean)) {
    throw new RangeError(`normal: mean은 finite number여야 한다. 받은 값: ${mean}`);
  }
  if (!Number.isFinite(stddev) || stddev < 0) {
    throw new RangeError(`normal: stddev는 0 이상의 finite number여야 한다. 받은 값: ${stddev}`);
  }
  return mean + standardNormal(rng) * stddev;
};
