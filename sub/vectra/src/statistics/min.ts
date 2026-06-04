import { assertNonEmptyFiniteValues } from './aggregate.internal';
import { canonicalizeNegativeZero } from './order-statistics.internal';

/**
 * `values`의 최솟값을 반환한다.
 *
 * `values`는 readonly number 배열이어야 한다. array가 아니면 `TypeError`. 빈 배열은 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`. 단일 패스로 minimum을 계산한다.
 * 결과의 `-0`은 `0`으로 canonicalize한다. input 배열은 mutate하지 않는다.
 *
 * @param values 최솟값을 계산할 number 배열. finite entry로만 구성된다.
 */
export function min(values: readonly number[]): number {
  assertNonEmptyFiniteValues(values, 'values');
  let result = values[0];
  for (let i = 1; i < values.length; i++) {
    const value = values[i];
    if (value < result) {
      result = value;
    }
  }
  return canonicalizeNegativeZero(result);
}
