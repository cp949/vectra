import { assertPositiveFinite, sampleStandardGamma } from './distribution.internal';
import type { RandomSource } from './random';

/**
 * gamma 분포 난수를 반환한다.
 *
 * `shape >= 1`은 Marsaglia-Tsang rejection 알고리즘, `0 < shape < 1`은 boost 변환을 사용한다. 따라서
 * branch별 `rng()` 소비 횟수가 달라지며, deterministic `RandomSource`와 함께 쓰면 알고리즘이 observable
 * behavior다. `rng()` 반환값은 clamp하거나 normalize하지 않는다.
 *
 * 결과가 non-finite이면 `RangeError`를 던진다. `logNormal`의 overflow 허용 정책과 달리 gamma 결과는
 * 분포 sample로 신뢰할 수 없기 때문이다.
 *
 * @param shape gamma shape parameter `k`. `> 0`인 finite number여야 한다.
 * @param scale gamma scale parameter `θ`. `> 0`인 finite number여야 한다. 기본값은 `1`.
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 * @throws {RangeError} shape 또는 scale이 finite number가 아니거나 0 이하일 때.
 * @throws {RangeError} 결과가 non-finite일 때.
 */
export const gamma = (shape: number, scale = 1, rng?: RandomSource): number => {
  assertPositiveFinite('gamma: shape', shape);
  assertPositiveFinite('gamma: scale', scale);

  const result = sampleStandardGamma(shape, rng) * scale;
  if (!Number.isFinite(result)) {
    throw new RangeError(`gamma: 결과가 non-finite다. shape=${shape}, scale=${scale}`);
  }
  return result;
};
