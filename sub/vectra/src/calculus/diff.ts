import { diffInto } from './diff-into';

/**
 * sequence `values`의 `order`차 forward discrete difference를 새 `number[]`로 반환한다.
 *
 * `values`는 array여야 한다. array가 아니면 `TypeError`.
 * `order` 미지정 시 기본 `1`. 지정 시 비음의 safe integer여야 한다. 위반 시 `RangeError`.
 * `values`의 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `order === 0`은 `values`의 entry-wise copy를 반환한다. order 0 copy 결과도 `-0`은 `0`으로
 * canonicalize한다(commit 단계 공통 정책).
 * `order === k > 0`은 forward difference를 `k`번 적용한다. 결과 length는
 * `max(0, values.length - order)`. `result[i] = input[i + 1] - input[i]`.
 * 매 단계 subtraction 결과는 finite여야 한다. 위반 시 `RangeError`. 결과 entry의 `-0`은 `0`으로
 * canonicalize한다.
 *
 *
 * caller-responsibility 가정은 `diffInto`와 동일하다.
 * @param values difference를 적용할 sequence. 호출 후에도 mutate되지 않는다.
 * @param order 적용할 forward difference 차수. 기본 `1`. 비음의 safe integer.
 */
export function diff(values: readonly number[], order?: number): number[] {
  return diffInto([], values, order);
}
