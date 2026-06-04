import { type RandomSource, random } from './random';

const MAX_TRIALS = 0xffffffff;

/**
 * 이항분포 count를 반환한다.
 *
 * 초기 구현은 `trials`번의 Bernoulli loop로 성공 횟수를 센다. 큰 `trials`에서는 느릴 수 있다.
 *
 * @param trials - 시행 횟수. `0..0xffffffff` safe integer여야 한다.
 * @param p - 각 시행의 성공 확률. `0 <= p <= 1`인 finite number여야 한다.
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 * @throws {RangeError} trials 또는 p가 유효 범위를 벗어날 때.
 */
export const binomial = (trials: number, p: number, rng?: RandomSource): number => {
  if (!Number.isSafeInteger(trials) || trials < 0 || trials > MAX_TRIALS) {
    throw new RangeError(`binomial: trials는 0..0xffffffff 범위의 safe integer여야 한다. 받은 값: ${trials}`);
  }
  if (!Number.isFinite(p) || p < 0 || p > 1) {
    throw new RangeError(`binomial: p는 [0, 1] 범위의 finite number여야 한다. 받은 값: ${p}`);
  }
  if (trials === 0 || p === 0) return 0;
  if (p === 1) return trials;

  let successes = 0;
  for (let i = 0; i < trials; i++) {
    if (random(rng) < p) {
      successes += 1;
    }
  }
  return successes;
};
