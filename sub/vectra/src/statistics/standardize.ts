import { standardizeInto } from './standardize-into';
import type { StandardizeOptions } from './types';

/**
 * `values`를 z-score로 변환한 결과를 새 `number[]`로 반환한다.
 *
 * 각 entry에 `(value - mean) / standardDeviation`을 적용한다. validation, denominator 정책, zero
 * standard deviation 처리, 실패 조건은 `standardizeInto`와 동일하다. 빈 배열은 `mode: "sample"`이어도
 * `[]`을 반환한다(no-op transform). `standardDeviation === 0`이면 같은 길이의 zero vector를 반환한다.
 * 결과의 `-0`은 `0`으로 canonicalize한다.
 *
 * @param values 표준화할 number 배열. finite entry로만 구성된다.
 * @param options 옵션. `mode` 기본 `"population"`.
 */
export function standardize(values: readonly number[], options?: StandardizeOptions): number[] {
  return standardizeInto([], values, options);
}
