import type { VarianceOptions } from './types';
import { variance } from './variance';

/**
 * `values`의 표준편차를 반환한다.
 *
 * `Math.sqrt(variance(values, options))`와 같다. validation, denominator 정책, 실패 조건은
 * `variance`와 동일하다.
 *
 * @param values 표준편차를 계산할 number 배열. finite entry로만 구성된다.
 * @param options 옵션. `mode` 기본 `"population"`.
 */
export function standardDeviation(values: readonly number[], options?: VarianceOptions): number {
  const varianceValue = variance(values, options);
  // variance가 finite 비음수라 sqrt도 finite다.
  return Math.sqrt(varianceValue);
}
