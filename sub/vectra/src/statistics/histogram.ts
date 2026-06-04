import { computeHistogramCounts, resolveHistogramBinEdges } from './histogram.internal';
import type { HistogramOptions, HistogramResult } from './types';
import { assertValuesArray } from './validate.internal';

/**
 * `values`의 histogram을 `{ counts, binEdges }` 결과 객체로 반환한다.
 *
 * 정책과 실패 분기는 `histogramInto`/`histogramBinEdges`와 동일하다. 각 결과 배열은 fresh `number[]`이고 `-0`은
 * `0`으로 canonicalize한다.
 *
 *
 * degenerate/empty 입력 처리 정책은 `histogramInto`와 동일하다.
 * @param values count할 finite number 배열. mutate하지 않는다.
 * @param options 옵션. `bins` 기본 `10`.
 */
export function histogram(values: readonly number[], options?: HistogramOptions): HistogramResult {
  assertValuesArray(values, 'values');
  const binEdges = resolveHistogramBinEdges(values, options);
  const rawCounts = computeHistogramCounts(values, binEdges);
  // commitSequenceInto와 동일한 -0 canonicalize를 fresh 배열에 적용한다.
  const counts = new Array<number>(rawCounts.length);
  for (let i = 0; i < rawCounts.length; i++) {
    const v = rawCounts[i];
    counts[i] = Object.is(v, -0) ? 0 : v;
  }
  return { counts, binEdges };
}
