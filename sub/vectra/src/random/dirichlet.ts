import { dirichletInto } from './dirichlet-into';
import type { RandomSource } from './random';

/**
 * Dirichlet 분포 sample을 새 `number[]`로 반환한다.
 *
 * 각 `alpha[i]`에 대해 `gamma(alpha[i], 1, rng)`을 뽑아 총합으로 normalize한다. 결과 length는
 * `alpha.length`이고, 모든 entry는 `[0, 1]` 범위이며 합은 floating error 허용 범위에서 `1`이다. gamma
 * sample은 `alpha` index 순서대로 소비하며, 각 gamma의 `rng()` 소비 횟수는 shape에 따라 달라진다.
 * `rng()` 반환값은 clamp하거나 normalize하지 않는다. 결과의 `-0`은 `0`으로 canonicalize한다.
 *
 * @param alpha non-empty concentration parameter array. 모든 entry는 `> 0`인 finite number여야 한다.
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 * @throws {TypeError} alpha가 array가 아닐 때.
 * @throws {RangeError} alpha가 비어 있거나 entry가 finite number가 아니거나 0 이하일 때.
 * @throws {RangeError} gamma 합이 0이거나 non-finite일 때.
 */
export const dirichlet = (alpha: readonly number[], rng?: RandomSource): number[] => dirichletInto([], alpha, rng);
