import { canonicalizeNegativeZero } from './order-statistics.internal';
import type { VarianceOptions } from './types';
import { assertValuesArray, assertVarianceMode } from './validate.internal';
import { computeWeightedMean } from './weighted.internal';

/**
 * `values`의 weighted 분산을 반환한다.
 *
 * `values`/`weights`는 같은 길이의 readonly number 배열이어야 한다. array가 아니면 `TypeError`.
 * 빈 배열 또는 `weights.length !== values.length`는 `RangeError`. `values[i]`가 finite가 아니면
 * `RangeError`. `weights[i]`가 finite `>= 0`이 아니면(음수, `NaN`, `Infinity`) `RangeError`.
 * `options.mode` 기본 `"population"`. `mode`가 `"population"`/`"sample"`이 아니면 `RangeError`.
 *
 * 1차 패스에서 `weightedSum`, `totalWeight = W`, `sumOfSquaredWeights = Σ wᵢ²`를 누적하며
 * 매 step finite를 검증한다. `totalWeight === 0`이면 `RangeError`. 이후 2차 패스에서
 * `weightedSquaredSum = Σ wᵢ·(xᵢ - weightedMean)²`을 누적하며 centered delta, 제곱, 가중곱,
 * 누적 합의 finite를 매 step 검증한다.
 *
 * denominator는 `mode`에 따라 다음과 같다.
 * - `"population"`: `W`. equal weights `w`일 때 `Σw(xᵢ-mean)² / (n·w) = Σ(xᵢ-mean)² / n`로
 *   unweighted population variance와 일치한다.
 * - `"sample"`: `W - (Σ wᵢ²) / W` (reliability weights 정의). equal weights `w`일 때
 *   분모는 `n·w - n·w²/(n·w) = (n - 1)·w`가 되어 unweighted sample variance와 일치한다.
 *   `denominator <= 0`이면 `RangeError`. 특히 `mode: "sample"`에서 단일 entry는 effective
 *   degrees of freedom이 0이 되므로 `RangeError`.
 *
 * 나눗셈 결과의 finite도 검증한다. 결과의 `-0`은 `0`으로 canonicalize한다. input 배열은 mutate
 * 하지 않는다.
 *
 * @param values 분산을 계산할 number 배열. finite entry로만 구성된다.
 * @param weights 각 `values[i]`에 대응하는 weight. finite `>= 0` entry로만 구성되고 total weight는
 *   양수여야 한다.
 * @param options 옵션. `mode` 기본 `"population"`.
 */
export function weightedVariance(
  values: readonly number[],
  weights: readonly number[],
  options?: VarianceOptions
): number {
  // 검증 순서: values/weights array → mode → length/entry. mode가 잘못된 경우 array 검증 이후
  // 곧바로 mode error를 던져야 length/entry error로 가려지지 않는다.
  assertValuesArray(values, 'values');
  assertValuesArray(weights, 'weights');
  const mode = options?.mode ?? 'population';
  assertVarianceMode(mode, 'options.mode');

  const { weightedMean, totalWeight, sumOfSquaredWeights } = computeWeightedMean(values, weights);

  const length = values.length;
  let weightedSquaredSum = 0;
  for (let i = 0; i < length; i++) {
    const delta = values[i] - weightedMean;
    if (!Number.isFinite(delta)) {
      throw new RangeError(`centered delta at index ${i} must be finite, got ${String(delta)}`);
    }
    const deltaSquared = delta * delta;
    if (!Number.isFinite(deltaSquared)) {
      throw new RangeError(`squared delta at index ${i} must be finite, got ${String(deltaSquared)}`);
    }
    const weightedDeltaSquared = weights[i] * deltaSquared;
    if (!Number.isFinite(weightedDeltaSquared)) {
      throw new RangeError(`weighted squared delta at index ${i} must be finite, got ${String(weightedDeltaSquared)}`);
    }
    weightedSquaredSum += weightedDeltaSquared;
    if (!Number.isFinite(weightedSquaredSum)) {
      throw new RangeError(`weightedSquaredSum must be finite, got ${String(weightedSquaredSum)} at index ${i}`);
    }
  }

  const denominator = mode === 'sample' ? totalWeight - sumOfSquaredWeights / totalWeight : totalWeight;
  if (!Number.isFinite(denominator) || denominator <= 0) {
    throw new RangeError(
      `weighted ${mode} variance requires positive effective degrees of freedom, got denominator=${String(denominator)}`
    );
  }
  const result = weightedSquaredSum / denominator;
  if (!Number.isFinite(result)) {
    throw new RangeError(`weighted variance must be finite, got ${String(result)}`);
  }
  return canonicalizeNegativeZero(result);
}
