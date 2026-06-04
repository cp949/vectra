import { canonicalizeNegativeZero, medianOfSorted, sortedFiniteCopy } from './order-statistics.internal';

/**
 * `values`의 raw median absolute deviation을 반환한다.
 *
 * 계산은 `m = median(values)`를 구한 뒤 `median(|xᵢ - m|)`을 반환한다. scaling constant
 * (예: 1.4826)를 적용하지 않으므로 결과는 정규분포 SD와 직접 비교 가능한 값이 아니다.
 *
 * `values`는 readonly number 배열이어야 한다. array가 아니면 `TypeError`. 빈 배열은 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`. 단계별 산술이 non-finite면
 * `RangeError`. 결과의 `-0`은 `0`으로 canonicalize한다. input 배열은 mutate하지 않는다.
 *
 * @param values MAD를 계산할 number 배열. finite entry로만 구성된다.
 */
export function medianAbsoluteDeviation(values: readonly number[]): number {
  const sorted = sortedFiniteCopy(values, 'values');
  const center = medianOfSorted(sorted);
  const length = sorted.length;
  const deviations = new Array<number>(length);
  for (let i = 0; i < length; i++) {
    const deviation = Math.abs(sorted[i] - center);
    if (!Number.isFinite(deviation)) {
      throw new RangeError(`absolute deviation at index ${i} must be finite, got ${String(deviation)}`);
    }
    deviations[i] = deviation;
  }
  deviations.sort((a, b) => a - b);
  const result = medianOfSorted(deviations);
  if (!Number.isFinite(result)) {
    throw new RangeError(`medianAbsoluteDeviation must be finite, got ${String(result)}`);
  }
  return canonicalizeNegativeZero(result);
}
