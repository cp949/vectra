import { computeCovarianceStats } from './covariance.internal';
import type { VarianceOptions } from './types';
import { assertValuesArray, assertVarianceMode } from './validate.internal';

/**
 * 두 vector의 Pearson correlation을 반환한다.
 *
 * `covariance(first, second) / (standardDeviation(first) * standardDeviation(second))`와 같은 값을
 * single-pass로 계산한다. `first`와 `second`는 readonly number 배열이어야 한다. array가 아니면
 * `TypeError`. 길이가 다르면 `RangeError`. 빈 배열은 `RangeError`. `options.mode` 기본 `"population"`.
 * `mode`가 `"population"`/`"sample"`이 아니면 `RangeError`. `mode: "sample"`에서 `first.length === 1`이면
 * `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`. covariance/standardDeviation
 * 계산이 non-finite면 `RangeError`. `first` 또는 `second`의 variance가 `0`이면 `RangeError`. 결과는
 * `[-1, 1]` 범위로 ULP 수준에서 clamp되지 않는다(부동소수점 오차로 경계를 벗어날 수 있음). 결과의 `-0`은
 * `0`으로 canonicalize한다.
 *
 * @param first correlation을 계산할 첫 vector. finite entry로만 구성된다.
 * @param second 같은 길이의 둘째 vector. finite entry로만 구성된다.
 * @param options 옵션. `mode` 기본 `"population"`. denominator 정책이 covariance/standardDeviation에 동일
 *   적용되므로 결과 ratio에는 영향을 주지 않는다. validation 분기(sample n<2)와 zero variance 분기는
 *   denominator를 거치지 않고도 동일하게 작동한다.
 */
export function correlation(first: readonly number[], second: readonly number[], options?: VarianceOptions): number {
  assertValuesArray(first, 'first');
  assertValuesArray(second, 'second');
  const mode = options?.mode ?? 'population';
  assertVarianceMode(mode, 'options.mode');

  const length = first.length;
  if (length === 0) {
    throw new RangeError('first must not be empty');
  }
  if (second.length !== length) {
    throw new RangeError(`second.length must equal first.length, got ${second.length} vs ${length}`);
  }
  if (mode === 'sample' && length < 2) {
    throw new RangeError(`sample correlation requires first.length >= 2, got ${length}`);
  }

  const { productSum, squaredSumX, squaredSumY } = computeCovarianceStats(first, second);
  if (squaredSumX === 0) {
    throw new RangeError('first variance must be non-zero for correlation');
  }
  if (squaredSumY === 0) {
    throw new RangeError('second variance must be non-zero for correlation');
  }
  // 두 squaredSum 모두 양수지만 큰 scale에서 곱이 overflow / 작은 scale에서 underflow될 수 있어
  // sqProduct, sqrt 결과를 각각 finite 가드한다.
  const sqProduct = squaredSumX * squaredSumY;
  if (!Number.isFinite(sqProduct)) {
    throw new RangeError(`squared sum product must be finite, got ${String(sqProduct)}`);
  }
  const denominator = Math.sqrt(sqProduct);
  if (!Number.isFinite(denominator) || denominator === 0) {
    throw new RangeError(`correlation denominator must be finite and non-zero, got ${String(denominator)}`);
  }
  const result = productSum / denominator;
  if (!Number.isFinite(result)) {
    throw new RangeError(`correlation must be finite, got ${String(result)}`);
  }
  return Object.is(result, -0) ? 0 : result;
}
