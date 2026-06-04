import { computeMeanWithSquaredSum } from './mean-squared-sum.internal';
import type { VarianceOptions } from './types';
import { assertValuesArray, assertVarianceMode } from './validate.internal';

/**
 * `values`의 분산을 반환한다.
 *
 * `values`는 readonly number 배열이어야 한다. array가 아니면 `TypeError`. 빈 배열은 `RangeError`.
 * `options.mode` 기본 `"population"`. `"population"` denominator는 `n`, `"sample"` denominator는 `n - 1`.
 * `mode`가 `"population"`/`"sample"`이 아니면 `RangeError`. `mode: "sample"`에서 `values.length === 1`이면
 * `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`. 누적 sum, centered delta,
 * delta 제곱, 제곱합, 나눗셈 결과 중 하나라도 non-finite면 `RangeError`. 결과는 항상 비음수다.
 *
 * @param values 분산을 계산할 number 배열. finite entry로만 구성된다.
 * @param options 옵션. `mode` 기본 `"population"`.
 */
export function variance(values: readonly number[], options?: VarianceOptions): number {
  assertValuesArray(values, 'values');
  const mode = options?.mode ?? 'population';
  assertVarianceMode(mode, 'options.mode');

  const length = values.length;
  if (length === 0) {
    throw new RangeError('values must not be empty');
  }
  if (mode === 'sample' && length < 2) {
    throw new RangeError(`sample variance requires values.length >= 2, got ${length}`);
  }

  const { squaredSum } = computeMeanWithSquaredSum(values);
  const denominator = mode === 'sample' ? length - 1 : length;
  const result = squaredSum / denominator;
  if (!Number.isFinite(result)) {
    throw new RangeError(`variance must be finite, got ${String(result)}`);
  }
  return result;
}
