/**
 * histogram / digitize / bincount의 bin lookup + count helper.
 *
 * half-open + last-inclusive bin index lookup과 산출된 edge 기반 count 집계를 모은다.
 */

/**
 * 산출된 bin edge를 사용해 `values`의 histogram count 배열을 산출한다.
 *
 * caller는 `values`가 array이고 `binEdges`가 `resolveHistogramBinEdges` 결과임을 보장한다. entry non-finite,
 * out-of-range value(`findBinIndex < 0`), 누적 count safe integer overflow는 모두 `RangeError`. 결과 count는
 * length `binEdges.length - 1`의 fresh `number[]`다.
 *
 * @param values count할 finite number 배열. mutate하지 않는다.
 * @param binEdges 산출된 strictly increasing bin edge 배열.
 */
export function computeHistogramCounts(values: readonly number[], binEdges: readonly number[]): number[] {
  const binCount = binEdges.length - 1;
  const counts = new Array<number>(binCount);
  for (let i = 0; i < binCount; i++) counts[i] = 0;

  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (!Number.isFinite(v)) {
      throw new RangeError(`values[${i}] must be a finite number, got ${String(v)}`);
    }
    const idx = findBinIndex(binEdges, v);
    if (idx < 0) {
      throw new RangeError(`values[${i}] (${v}) is out of histogram range [${binEdges[0]}, ${binEdges[binCount]}]`);
    }
    const next = counts[idx] + 1;
    if (!Number.isSafeInteger(next)) {
      throw new RangeError(`histogram count overflow at bin ${idx}, got ${String(next)}`);
    }
    counts[idx] = next;
  }
  return counts;
}

/**
 * half-open + last-bin-inclusive bin index를 binary search로 찾는다.
 *
 *  - `value < binEdges[0]` 또는 `value > binEdges[last]`이면 `-1`을 반환한다(caller가 정책별로 RangeError 또는 ignore 처리).
 *  - 그 외에는 `binEdges[i] <= value < binEdges[i+1]`인 index `i`를 반환한다.
 *  - `value === binEdges[last]`이면 마지막 bin index(`binCount - 1`)을 반환한다(last-bin inclusive).
 *
 * caller는 `binEdges`가 strictly increasing이고 length `>= 2`임을 보장한다.
 *
 * @param binEdges strictly increasing edge 배열
 * @param value lookup할 값
 */
export function findBinIndex(binEdges: readonly number[], value: number): number {
  const last = binEdges.length - 1;
  if (value < binEdges[0]) return -1;
  if (value > binEdges[last]) return -1;
  if (value === binEdges[last]) return last - 1;
  // half-open: 가장 큰 i such that binEdges[i] <= value
  let lo = 0;
  let hi = last;
  while (lo + 1 < hi) {
    // bitwise int32 coercion 회피를 위해 Math.floor 사용. binEdges 길이가 safe integer 안에서는 동일하다.
    const mid = Math.floor((lo + hi) / 2);
    if (binEdges[mid] <= value) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return lo;
}
