import { cumulativeSumInto } from './cumulative-sum-into';

/**
 * sequence `values`의 cumulative sum을 새 `number[]`로 반환한다.
 *
 * `values`는 array여야 한다. array가 아니면 `TypeError`.
 * `values`의 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `values.length === 0`은 `[]`.
 * `values.length >= 1`은 length가 `values.length`인 sequence를 만든다.
 * `result[0] = values[0]`, `result[i] = result[i-1] + values[i]`.
 * 매 partial sum은 finite여야 한다. 위반 시 `RangeError`. 결과 entry의 `-0`은 `0`으로 canonicalize한다.
 *
 * @param values 누적 합산을 적용할 sequence. 호출 후에도 mutate되지 않는다.
 */
export function cumulativeSum(values: readonly number[]): number[] {
  return cumulativeSumInto([], values);
}
