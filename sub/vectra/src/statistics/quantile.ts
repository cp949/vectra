import { canonicalizeNegativeZero, quantileOfSorted, sortedFiniteCopy } from './order-statistics.internal';

/**
 * `values`의 `q` 분위수를 linear interpolation between closest ranks로 반환한다.
 *
 * `values`는 readonly number 배열이어야 한다. array가 아니면 `TypeError`. 빈 배열은 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`. `q`는 `[0, 1]` finite. 위반 시 `RangeError`.
 * 계산은 ascending sorted copy를 만든 뒤 numpy/R default "type 7" 정의를 사용한다.
 * `pos = q * (n - 1)`, `lo = floor(pos)`, `hi = ceil(pos)`, `fraction = pos - lo`,
 * `result = sorted[lo] + fraction * (sorted[hi] - sorted[lo])`. `q === 0`은 minimum, `q === 1`은 maximum.
 * interpolation 결과가 non-finite면 `RangeError`. 결과의 `-0`은 `0`으로 canonicalize한다.
 * input 배열은 mutate하지 않는다.
 *
 * @param values 분위수를 계산할 number 배열. finite entry로만 구성된다.
 * @param q `[0, 1]` 범위의 finite 분위수 위치
 */
export function quantile(values: readonly number[], q: number): number {
  if (!Number.isFinite(q) || q < 0 || q > 1) {
    throw new RangeError(`q must be a finite number in [0, 1], got ${String(q)}`);
  }
  const sorted = sortedFiniteCopy(values, 'values');
  const result = quantileOfSorted(sorted, q);
  if (!Number.isFinite(result)) {
    throw new RangeError(`quantile result must be finite for q=${q}, got ${String(result)}`);
  }
  return canonicalizeNegativeZero(result);
}
