import { computeCovarianceStats } from './covariance.internal';
import type { VarianceOptions } from './types';
import { assertValuesArray, assertVarianceMode } from './validate.internal';

/**
 * 두 vector의 covariance를 반환한다.
 *
 * `first`와 `second`는 readonly number 배열이어야 한다. array가 아니면 `TypeError`. 길이가 다르면
 * `RangeError`. 빈 배열은 `RangeError`. `options.mode` 기본 `"population"`. `"population"` denominator는
 * `n`, `"sample"` denominator는 `n - 1`. `mode`가 `"population"`/`"sample"`이 아니면 `RangeError`.
 * `mode: "sample"`에서 `first.length === 1`이면 `RangeError`. 모든 entry는 finite number여야 한다.
 * 위반 시 `RangeError`. 누적 sum, centered delta, centered product, product sum, 나눗셈 결과 중 하나라도
 * non-finite면 `RangeError`. 결과의 `-0`은 `0`으로 canonicalize한다.
 *
 * @param first covariance를 계산할 첫 vector. finite entry로만 구성된다.
 * @param second 같은 길이의 둘째 vector. finite entry로만 구성된다.
 * @param options 옵션. `mode` 기본 `"population"`.
 */
export function covariance(first: readonly number[], second: readonly number[], options?: VarianceOptions): number {
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
    throw new RangeError(`sample covariance requires first.length >= 2, got ${length}`);
  }

  const { productSum } = computeCovarianceStats(first, second);
  const denominator = mode === 'sample' ? length - 1 : length;
  const result = productSum / denominator;
  if (!Number.isFinite(result)) {
    throw new RangeError(`covariance must be finite, got ${String(result)}`);
  }
  return Object.is(result, -0) ? 0 : result;
}
