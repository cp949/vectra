import { computeHistogramCounts, resolveHistogramBinEdges } from './histogram.internal';
import { commitSequenceInto } from './sequence-commit.internal';
import type { HistogramOptions } from './types';
import { assertValuesArray } from './validate.internal';

/**
 * `values`의 histogram count를 `out`에 기록한다.
 *
 * bin edge는 `histogramBinEdges(values, options)`와 같은 정책으로 산출된다(자세한 정책은 그 함수 JSDoc 참고).
 * 결과 count는 length `binCount`(`binEdges.length - 1`)의 non-negative safe integer 배열이고,
 * `out`에는 count만 commit된다. bin edge가 필요하면 `histogramBinEdges` 또는 `histogram`을 사용한다.
 *
 * bin 매핑은 half-open `[edge[i], edge[i+1])` + 마지막 bin만 right-inclusive `[lastLower, lastUpper]`다.
 * `options.range` 지정 시 `values` 중 `min` 미만 또는 `max` 초과 entry는 `RangeError`(silent ignore 아님).
 * `bins`가 explicit edge인 경우에는 `values` 중 `edges[0]` 미만 또는 `edges[last]` 초과 entry가 `RangeError`다.
 *
 * `values`는 array가 아니면 `TypeError`. entry non-finite, 누적 count가 safe integer 범위 벗어나면 `RangeError`.
 * 옵션 검증과 bin edge 산출은 빈 입력에서도 fail-fast다(예: `bins: number` + 빈 `values` + `range` 미지정은 `RangeError`).
 *
 * validation 또는 산술 실패 시 `out`은 호출 전 상태 그대로 남는다(모든 산술이 끝난 뒤 단일 commit). `out`과
 * `values`가 같은 배열이어도 안전하다(temp count 배열에서 산출한 뒤 commit). 결과 entry의 `-0`은 `0`으로
 * canonicalize한다. 반환값은 `out`이다.
 *
 * @param out histogram count를 기록할 writable storage. 호출 전 length는 무시되고 commit 후 `binCount` length를 가진다.
 * @param values count할 finite number 배열. mutate하지 않는다.
 * @param options 옵션. `bins` 기본 `10`.
 */
export function histogramInto(out: number[], values: readonly number[], options?: HistogramOptions): number[] {
  assertValuesArray(values, 'values');
  const binEdges = resolveHistogramBinEdges(values, options);
  const counts = computeHistogramCounts(values, binEdges);
  commitSequenceInto(out, counts);
  return out;
}
