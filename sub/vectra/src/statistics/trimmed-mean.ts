import { canonicalizeNegativeZero, sortedFiniteCopy } from './order-statistics.internal';

/**
 * `values`의 trimmed mean을 반환한다.
 *
 * `fraction`은 finite number `0 <= fraction < 0.5`여야 한다. 위반 시 `RangeError`. `fraction` 검증은
 * `values` 산술보다 먼저 fail-fast로 수행한다. `values`는 readonly number 배열이어야 한다. array가
 * 아니면 `TypeError`. 빈 배열은 `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * ascending sorted copy에서 양끝 `trimCount = floor(values.length * fraction)`개를 제거한 뒤 남은
 * `[trimCount, length - trimCount)` 범위의 산술 평균을 반환한다. `fraction < 0.5`이므로 non-empty
 * 입력에서는 trimmed 범위가 비지 않는다(빈 범위는 방어용 `RangeError`). 누적 sum과 결과의 finite를
 * 검증한다. 위반 시 `RangeError`. 결과의 `-0`은 `0`으로 canonicalize한다. input 배열은 mutate하지 않는다.
 *
 * @param values trimmed mean을 계산할 number 배열. finite entry로만 구성된다.
 * @param fraction 양끝에서 제거할 비율. finite `0 <= fraction < 0.5`.
 */
export function trimmedMean(values: readonly number[], fraction: number): number {
  if (!Number.isFinite(fraction) || fraction < 0 || fraction >= 0.5) {
    throw new RangeError(`fraction must be a finite number in [0, 0.5), got ${String(fraction)}`);
  }
  const sorted = sortedFiniteCopy(values, 'values');
  const length = sorted.length;
  const trimCount = Math.floor(length * fraction);
  const lo = trimCount;
  const hi = length - trimCount;
  const count = hi - lo;
  if (count <= 0) {
    // fraction < 0.5 + length >= 1이면 도달하지 않는 방어 분기.
    throw new RangeError(`trimmedMean has no values left after trimming ${trimCount} from each end of ${length}`);
  }
  let sum = 0;
  for (let i = lo; i < hi; i++) {
    sum += sorted[i];
    if (!Number.isFinite(sum)) {
      throw new RangeError(`trimmed mean sum must be finite, got ${String(sum)} at index ${i}`);
    }
  }
  const result = sum / count;
  if (!Number.isFinite(result)) {
    throw new RangeError(`trimmed mean must be finite, got ${String(result)}`);
  }
  return canonicalizeNegativeZero(result);
}
