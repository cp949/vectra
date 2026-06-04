/**
 * histogram / digitize / bincount의 공유 helper.
 *
 * bin edge 검증과 산출, label/safe integer 검증, half-open + last-inclusive bin lookup을 모은다.
 * public leaf는 이 helper를 거쳐 같은 정책을 적용한다.
 */

import type { HistogramOptions } from './types';
import { assertValuesArray } from './validate.internal';

/**
 * `value`가 non-negative safe integer임을 검증한다. 위반 시 `RangeError`.
 *
 * `number` 타입이지만 non-integer / 음수 / `Infinity` / `NaN` / `Number.MAX_SAFE_INTEGER` 초과는 모두 거부.
 *
 * @param value 검증할 값
 * @param name error message에 사용할 인자 이름
 */
export function assertNonNegativeSafeInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative safe integer, got ${String(value)}`);
  }
}

/**
 * `value`가 positive safe integer(`>= 1`)임을 검증한다. 위반 시 `RangeError`.
 *
 * @param value 검증할 값
 * @param name error message에 사용할 인자 이름
 */
export function assertPositiveSafeInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new RangeError(`${name} must be a positive safe integer, got ${String(value)}`);
  }
}

/**
 * explicit bin edge 배열을 검증한다.
 *
 * top-level 또는 entry가 number 배열이 아니면 `TypeError`. length `< 2`, finite 위반, strictly
 * increasing 위반은 모두 `RangeError`.
 *
 * @param edges 검증할 bin edge 배열
 * @param name error message에 사용할 인자 이름
 */
export function assertExplicitBinEdges(edges: unknown, name: string): asserts edges is readonly number[] {
  assertValuesArray(edges, name);
  const arr = edges as readonly number[];
  if (arr.length < 2) {
    throw new RangeError(`${name} must have length >= 2, got ${arr.length}`);
  }
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (typeof v !== 'number') {
      throw new TypeError(`${name}[${i}] must be a number, got ${typeof v}`);
    }
    if (!Number.isFinite(v)) {
      throw new RangeError(`${name}[${i}] must be a finite number, got ${String(v)}`);
    }
  }
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] <= arr[i - 1]) {
      throw new RangeError(
        `${name} must be strictly increasing: ${name}[${i - 1}] (${arr[i - 1]}) >= ${name}[${i}] (${arr[i]})`
      );
    }
  }
}

/**
 * `range` 옵션이 `[min, max]` finite tuple이고 `min < max`인지 검증한다.
 *
 * top-level이 array가 아니면 `TypeError`. length !== 2, entry non-number, non-finite, `min >= max`는 `RangeError`.
 *
 * @param range 검증할 range 옵션
 * @param name error message에 사용할 인자 이름
 */
export function assertExplicitRange(range: unknown, name: string): asserts range is readonly [number, number] {
  if (!Array.isArray(range)) {
    throw new TypeError(`${name} must be a readonly [number, number], got ${typeof range}`);
  }
  if (range.length !== 2) {
    throw new RangeError(`${name} must have length 2, got ${range.length}`);
  }
  const [min, max] = range as readonly unknown[];
  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new TypeError(`${name} entries must be number, got [${typeof min}, ${typeof max}]`);
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new RangeError(`${name} entries must be finite, got [${String(min)}, ${String(max)}]`);
  }
  if (min >= max) {
    throw new RangeError(`${name} must satisfy min < max, got [${min}, ${max}]`);
  }
}

/**
 * `values`의 finite min/max를 한 패스로 산출한다.
 *
 * caller는 `values`가 array이고 length `>= 1`임을 보장한다. entry non-finite는 `RangeError`.
 *
 * @param values finite number 배열
 * @param name error message에 사용할 인자 이름
 */
export function scanFiniteMinMax(values: readonly number[], name: string): { min: number; max: number } {
  let min = values[0];
  if (!Number.isFinite(min)) {
    throw new RangeError(`${name}[0] must be a finite number, got ${String(min)}`);
  }
  let max = min;
  for (let i = 1; i < values.length; i++) {
    const v = values[i];
    if (!Number.isFinite(v)) {
      throw new RangeError(`${name}[${i}] must be a finite number, got ${String(v)}`);
    }
    if (v < min) min = v;
    else if (v > max) max = v;
  }
  return { min, max };
}

/**
 * `[min, max]` 구간을 `binCount`개의 균등 bin으로 나눈 edge 배열을 생성한다.
 *
 * `min === max`이면 deterministic `[min - 0.5, max + 0.5]`로 확장한 뒤 분할한다.
 *
 * edge 계산 결과가 non-finite면 `RangeError`. 마지막 edge는 산식이 아니라 `max` 직접 기록으로 drift를 회피한다.
 *
 * @param min lower bound
 * @param max upper bound. caller는 `min <= max` 보장.
 * @param binCount positive safe integer
 */
export function buildUniformBinEdges(min: number, max: number, binCount: number): number[] {
  let lo = min;
  let hi = max;
  if (lo === hi) {
    lo = min - 0.5;
    hi = max + 0.5;
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
      throw new RangeError(
        `histogram bin edge expansion for max === min produced non-finite bound, got [${String(lo)}, ${String(hi)}]`
      );
    }
  }
  const span = hi - lo;
  if (!Number.isFinite(span) || span <= 0) {
    throw new RangeError(`histogram bin edge span must be finite and > 0, got ${String(span)}`);
  }
  const edges = new Array<number>(binCount + 1);
  edges[0] = lo;
  for (let i = 1; i < binCount; i++) {
    const value = lo + (span * i) / binCount;
    if (!Number.isFinite(value)) {
      throw new RangeError(`histogram bin edge at index ${i} must be finite, got ${String(value)}`);
    }
    edges[i] = value;
  }
  edges[binCount] = hi;
  return edges;
}

/** `HistogramOptions.bins` default. */
export const DEFAULT_BIN_COUNT = 10;

/**
 * `HistogramOptions`를 받아 bin edge 배열을 fresh `number[]`로 산출한다. `-0` canonicalize까지 적용한다.
 *
 * caller는 `values`가 array임을 보장한다(`assertValuesArray`를 미리 호출). 옵션 검증/finite scan/edge 산식
 * 실패 분기는 모두 `RangeError`/`TypeError`로 전파한다. `histogramBinEdges`, `histogramInto`, `histogram`이 공유한다.
 *
 * @param values bin edge 산출에 사용할 finite number 배열. mutate하지 않는다.
 * @param options 옵션. `bins` 기본 `10`.
 */
export function resolveHistogramBinEdges(values: readonly number[], options?: HistogramOptions): number[] {
  const bins = options?.bins ?? DEFAULT_BIN_COUNT;

  if (Array.isArray(bins)) {
    assertExplicitBinEdges(bins, 'options.bins');
    const edges = bins as readonly number[];
    const result = new Array<number>(edges.length);
    for (let i = 0; i < edges.length; i++) {
      const v = edges[i];
      result[i] = Object.is(v, -0) ? 0 : v;
    }
    return result;
  }

  if (typeof bins !== 'number') {
    throw new TypeError(`options.bins must be number or readonly number[], got ${typeof bins}`);
  }
  assertPositiveSafeInteger(bins, 'options.bins');

  let min: number;
  let max: number;
  if (options?.range !== undefined) {
    assertExplicitRange(options.range, 'options.range');
    min = options.range[0];
    max = options.range[1];
  } else {
    if (values.length === 0) {
      throw new RangeError(`histogram requires options.range when values is empty and bins is a count`);
    }
    const scanned = scanFiniteMinMax(values, 'values');
    min = scanned.min;
    max = scanned.max;
  }

  const edges = buildUniformBinEdges(min, max, bins);
  for (let i = 0; i < edges.length; i++) {
    const v = edges[i];
    if (Object.is(v, -0)) edges[i] = 0;
  }
  return edges;
}

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
