import { canonicalizeNegativeZero } from './order-statistics.internal';
import { computeWeightedMean } from './weighted.internal';

/**
 * `values`의 weighted 산술 평균을 반환한다.
 *
 * `values`/`weights`는 같은 길이의 readonly number 배열이어야 한다. array가 아니면 `TypeError`.
 * 빈 배열 또는 `weights.length !== values.length`는 `RangeError`. `values[i]`가 finite가 아니면
 * `RangeError`. `weights[i]`가 finite `>= 0`이 아니면(음수, `NaN`, `Infinity`) `RangeError`.
 * 단일 패스로 `weightedSum = Σ wᵢ·xᵢ`와 `totalWeight = Σ wᵢ`의 finite 여부를 매 step 검증한다.
 * `totalWeight === 0`이면 `RangeError`. `weightedSum / totalWeight`의 finite도 검증한다. 결과의
 * `-0`은 `0`으로 canonicalize한다. input 배열은 mutate하지 않는다.
 *
 * 모든 `weights[i]`가 같은 양수 값이면 결과는 `mean(values)`와 같다.
 *
 * @param values 평균을 계산할 number 배열. finite entry로만 구성된다.
 * @param weights 각 `values[i]`에 대응하는 weight. finite `>= 0` entry로만 구성되고 total weight는
 *   양수여야 한다.
 */
export function weightedMean(values: readonly number[], weights: readonly number[]): number {
  const { weightedMean: result } = computeWeightedMean(values, weights);
  return canonicalizeNegativeZero(result);
}
