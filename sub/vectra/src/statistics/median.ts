import { canonicalizeNegativeZero, medianOfSorted, sortedFiniteCopy } from './order-statistics.internal';

/**
 * `values`의 중앙값을 반환한다.
 *
 * `quantile(values, 0.5)`와 동치이며 type 7 linear interpolation을 따른다. 구체적 method,
 * validation 정책, signed-zero canonicalize는 `quantile` 문서를 참조한다. odd length는 가운데
 * entry, even length는 가운데 두 entry의 산술 평균이다. input 배열은 mutate하지 않는다.
 *
 * @param values 중앙값을 계산할 number 배열. finite entry로만 구성된다.
 */
export function median(values: readonly number[]): number {
  const sorted = sortedFiniteCopy(values, 'values');
  const result = medianOfSorted(sorted);
  if (!Number.isFinite(result)) {
    throw new RangeError(`median result must be finite, got ${String(result)}`);
  }
  return canonicalizeNegativeZero(result);
}
