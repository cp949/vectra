import { computeCentralMoments } from './moment.internal';
import { canonicalizeNegativeZero } from './order-statistics.internal';
import type { VarianceOptions } from './types';
import { assertValuesArray, assertVarianceMode } from './validate.internal';

/**
 * `values`의 skewness(third standardized central moment)를 반환한다.
 *
 * `mode === "population"`(기본)이면 population skewness `g1 = m3 / m2^(3/2)`을 반환한다.
 * 여기서 `m2 = Σ(xᵢ - m1)² / N`, `m3 = Σ(xᵢ - m1)³ / N`이다.
 * `mode === "sample"`이면 Fisher-Pearson adjusted standard estimator
 * `sqrt(N(N-1)) / (N-2) * g1`을 반환한다(R/SciPy `bias=False`와 동일).
 *
 * `values`는 readonly number 배열이어야 한다. array가 아니면 `TypeError`. 빈 배열은 `RangeError`.
 * `options.mode`가 `"population"`/`"sample"`이 아니면 `RangeError`. `mode === "sample"`에서
 * `values.length < 3`이면 `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `m2 === 0`(zero variance)이면 `RangeError`. 누적 또는 단계별 산술이 non-finite면 `RangeError`.
 * 결과의 `-0`은 `0`으로 canonicalize한다. input 배열은 mutate하지 않는다.
 *
 * @param values skewness를 계산할 number 배열. finite entry로만 구성된다.
 * @param options 옵션. `mode` 기본 `"population"`.
 */
export function skewness(values: readonly number[], options?: VarianceOptions): number {
  assertValuesArray(values, 'values');
  const mode = options?.mode ?? 'population';
  assertVarianceMode(mode, 'options.mode');
  const length = values.length;
  if (length === 0) {
    throw new RangeError('values must not be empty');
  }
  if (mode === 'sample' && length < 3) {
    throw new RangeError(`sample skewness requires values.length >= 3, got ${length}`);
  }

  const { squaredSum, cubedSum } = computeCentralMoments(values);
  if (squaredSum === 0) {
    throw new RangeError('skewness requires positive variance');
  }
  const m2 = squaredSum / length;
  const m3 = cubedSum / length;
  // m2 > 0 + finite에서 m2^(3/2)은 finite. 방어용 가드.
  const denominator = m2 ** 1.5;
  if (!Number.isFinite(denominator) || denominator === 0) {
    throw new RangeError(`skewness denominator must be a positive finite number, got ${String(denominator)}`);
  }
  const g1 = m3 / denominator;
  let result = g1;
  if (mode === 'sample') {
    result = (Math.sqrt(length * (length - 1)) / (length - 2)) * g1;
  }
  if (!Number.isFinite(result)) {
    throw new RangeError(`skewness must be finite, got ${String(result)}`);
  }
  return canonicalizeNegativeZero(result);
}
