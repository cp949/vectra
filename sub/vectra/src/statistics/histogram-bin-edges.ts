import { resolveHistogramBinEdges } from './histogram.internal';
import type { HistogramOptions } from './types';
import { assertValuesArray } from './validate.internal';

/**
 * `values`에 대한 histogram bin edge 배열을 새 `number[]`로 반환한다.
 *
 * `values`는 readonly number 배열이어야 한다. array가 아니면 `TypeError`.
 *
 * `options.bins` 기본 `10`. `number`(positive safe integer `>= 1`)는 bin 개수,
 * `readonly number[]`(length `>= 2`, finite, strictly increasing)는 explicit edge다. `bins`가 explicit edge면
 * `options.range`는 silent ignore되고 입력 그대로 fresh copy(`-0`은 `0`으로 canonicalize)를 반환한다.
 * `options.range`가 `[min, max]` finite tuple이고 `min < max`이면 explicit range로 균등 분할한다.
 * 둘 다 미지정이면 `values`의 finite min/max로 균등 분할한다. `max === min`(또는 length 1) deterministic
 * fallback은 `[v - 0.5, v + 0.5]`이다. `bins: number` + `values.length === 0` + `range` 미지정은 `RangeError`다.
 * 옵션 검증은 `values` 빈 입력에서도 fail-fast다.
 *
 * 산식 누적, span, 균등 분할 결과가 non-finite면 `RangeError`. 결과 edge `-0`은 `0`으로 canonicalize.
 *
 * @param values bin edge 산출에 사용할 finite number 배열. mutate하지 않는다.
 * @param options 옵션. `bins` 기본 `10`.
 */
export function histogramBinEdges(values: readonly number[], options?: HistogramOptions): number[] {
  assertValuesArray(values, 'values');
  return resolveHistogramBinEdges(values, options);
}
