import { computeCentralMoments } from './moment.internal';
import { canonicalizeNegativeZero } from './order-statistics.internal';
import type { VarianceOptions } from './types';
import { assertValuesArray, assertVarianceMode } from './validate.internal';

/**
 * `values`의 excess kurtosis(정규분포에서 0)를 반환한다.
 *
 * `mode === "population"`(기본)이면 population excess kurtosis `g2 = m4 / m2² - 3`을 반환한다.
 * 여기서 `m2 = Σ(xᵢ - m1)² / N`, `m4 = Σ(xᵢ - m1)⁴ / N`이다.
 * `mode === "sample"`이면 Fisher-Pearson adjusted standard estimator
 * `(N-1) / ((N-2)(N-3)) * ((N+1) * g2 + 6)`을 반환한다(R/SciPy `bias=False`와 동일).
 *
 * `values`는 readonly number 배열이어야 한다. array가 아니면 `TypeError`. 빈 배열은 `RangeError`.
 * `options.mode`가 `"population"`/`"sample"`이 아니면 `RangeError`. `mode === "sample"`에서
 * `values.length < 4`이면 `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `m2 === 0`(zero variance)이면 `RangeError`. 누적 또는 단계별 산술이 non-finite면 `RangeError`.
 * 결과의 `-0`은 `0`으로 canonicalize한다. input 배열은 mutate하지 않는다.
 *
 * @param values kurtosis를 계산할 number 배열. finite entry로만 구성된다.
 * @param options 옵션. `mode` 기본 `"population"`.
 */
export function kurtosis(values: readonly number[], options?: VarianceOptions): number {
  assertValuesArray(values, 'values');
  const mode = options?.mode ?? 'population';
  assertVarianceMode(mode, 'options.mode');
  const length = values.length;
  if (length === 0) {
    throw new RangeError('values must not be empty');
  }
  if (mode === 'sample' && length < 4) {
    throw new RangeError(`sample kurtosis requires values.length >= 4, got ${length}`);
  }

  const { squaredSum, fourthSum } = computeCentralMoments(values);
  if (squaredSum === 0) {
    throw new RangeError('kurtosis requires positive variance');
  }
  const m2 = squaredSum / length;
  const m4 = fourthSum / length;
  const m2Squared = m2 * m2;
  // m2 > 0 + finite에서 m2² > 0 + finite. 방어용 가드.
  if (!Number.isFinite(m2Squared) || m2Squared === 0) {
    throw new RangeError(`kurtosis denominator must be a positive finite number, got ${String(m2Squared)}`);
  }
  const populationExcess = m4 / m2Squared - 3;
  let result = populationExcess;
  if (mode === 'sample') {
    // 표준 sample bias-corrected excess kurtosis 변환.
    // (N-1) / ((N-2)(N-3)) * ((N+1) * g2 + 6)
    result = ((length - 1) / ((length - 2) * (length - 3))) * ((length + 1) * populationExcess + 6);
  }
  if (!Number.isFinite(result)) {
    throw new RangeError(`kurtosis must be finite, got ${String(result)}`);
  }
  return canonicalizeNegativeZero(result);
}
