/**
 * histogram / digitize / bincount의 bin edge 산출 helper.
 *
 * finite min/max scan, 균등 bin edge 생성, `HistogramOptions` 기반 bin edge 해석을 모은다.
 */

import { assertExplicitBinEdges, assertExplicitRange, assertPositiveSafeInteger } from './histogram-validate.internal';
import type { HistogramOptions } from './types';

/** `HistogramOptions.bins` default. */
export const DEFAULT_BIN_COUNT = 10;

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
