import { type RandomSource, random } from './random';

/**
 * 베르누이 시행 결과를 반환한다.
 *
 * `p`의 확률로 `true`, `1 - p`의 확률로 `false`를 반환한다.
 * 경계값 처리: `p <= 0`이면 `false`, `p >= 1`이면 `true`.
 * 중간값은 `random(rng) < p`로 판정한다.
 *
 * @param p - 성공 확률. `0 <= p <= 1`인 finite number여야 한다.
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 * @throws {RangeError} p가 finite number가 아니거나 `[0, 1]` 범위를 벗어날 때.
 */
export const bernoulli = (p: number, rng?: RandomSource): boolean => {
  if (!Number.isFinite(p) || p < 0 || p > 1) {
    throw new RangeError(`bernoulli: p는 [0, 1] 범위의 finite number여야 한다. 받은 값: ${p}`);
  }
  if (p <= 0) return false;
  if (p >= 1) return true;
  return random(rng) < p;
};
