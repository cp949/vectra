import { assertPositiveFinite, sampleStandardGamma } from './distribution.internal';
import type { RandomSource } from './random';

/**
 * beta 분포 난수를 `[0, 1]` 범위에서 반환한다.
 *
 * 두 standard gamma sample `ga = gamma(alpha, 1, rng)`, `gb = gamma(betaShape, 1, rng)`을 차례로 뽑아
 * `ga / (ga + gb)`로 계산한다. `gamma`와 같은 gamma kernel을 공유하므로 `alpha`용 gamma를 먼저 소비한다.
 * 각 gamma의 `rng()` 소비 횟수는 shape에 따라 달라진다. `rng()` 반환값은 clamp하거나 normalize하지 않는다.
 *
 * 두 gamma 합이 `0`이거나 non-finite이면 결과를 신뢰할 수 없으므로 `RangeError`를 던진다.
 *
 * @param alpha 첫 번째 shape parameter `α`. `> 0`인 finite number여야 한다.
 * @param betaShape 두 번째 shape parameter `β`. `> 0`인 finite number여야 한다.
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 * @throws {RangeError} alpha 또는 betaShape이 finite number가 아니거나 0 이하일 때.
 * @throws {RangeError} 두 gamma 합이 0이거나 non-finite일 때.
 */
export const beta = (alpha: number, betaShape: number, rng?: RandomSource): number => {
  assertPositiveFinite('beta: alpha', alpha);
  assertPositiveFinite('beta: beta', betaShape);

  const ga = sampleStandardGamma(alpha, rng);
  const gb = sampleStandardGamma(betaShape, rng);
  const sum = ga + gb;
  if (!Number.isFinite(sum) || sum === 0) {
    throw new RangeError(`beta: gamma 합이 0이거나 non-finite다. alpha=${alpha}, beta=${betaShape}`);
  }
  return ga / sum;
};
