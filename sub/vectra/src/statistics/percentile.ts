import { canonicalizeNegativeZero, quantileOfSorted, sortedFiniteCopy } from './order-statistics.internal';

/**
 * `values`의 `p` 백분위수를 반환한다.
 *
 * `quantile(values, p / 100)`과 동치이며 type 7 linear interpolation을 따른다. 구체적 method,
 * validation 정책, signed-zero canonicalize는 `quantile` 문서를 참조한다. `p`는 `[0, 100]` finite.
 * 위반 시 `RangeError`. `values` validation은 `quantile`과 동일하다(array가 아니면 `TypeError`,
 * 빈 배열·non-finite entry는 `RangeError`). input 배열은 mutate하지 않는다.
 *
 * @param values 백분위수를 계산할 number 배열. finite entry로만 구성된다.
 * @param p `[0, 100]` 범위의 finite 백분위수 위치
 */
export function percentile(values: readonly number[], p: number): number {
  if (!Number.isFinite(p) || p < 0 || p > 100) {
    throw new RangeError(`p must be a finite number in [0, 100], got ${String(p)}`);
  }
  const q = p / 100;
  const sorted = sortedFiniteCopy(values, 'values');
  const result = quantileOfSorted(sorted, q);
  if (!Number.isFinite(result)) {
    throw new RangeError(`percentile result must be finite for p=${p}, got ${String(result)}`);
  }
  return canonicalizeNegativeZero(result);
}
