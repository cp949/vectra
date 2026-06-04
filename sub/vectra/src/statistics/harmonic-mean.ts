import { canonicalizeNegativeZero } from './order-statistics.internal';
import { assertValuesArray } from './validate.internal';

/**
 * `values` entry의 조화 평균을 반환한다.
 *
 * `values`는 readonly number 배열이어야 한다. array가 아니면 `TypeError`. 빈 배열은 `RangeError`.
 * 모든 entry는 finite number `> 0`여야 한다. 위반 시 `RangeError`. `0`/`-0`/음수는 모두 `RangeError`.
 * `n / Σ(1 / xᵢ)`로 계산하며 reciprocal 누적 sum의 finite 여부를 매 step 검증한다. reciprocal sum
 * 또는 최종 결과가 non-finite면 `RangeError`. 결과의 `-0`은 `0`으로 canonicalize한다. input 배열은
 * mutate하지 않는다.
 *
 * @param values 조화 평균을 계산할 number 배열. finite, 양의 entry로만 구성된다.
 */
export function harmonicMean(values: readonly number[]): number {
  assertValuesArray(values, 'values');
  const length = values.length;
  if (length === 0) {
    throw new RangeError('values must not be empty');
  }
  let reciprocalSum = 0;
  for (let i = 0; i < length; i++) {
    const value = values[i];
    if (!Number.isFinite(value)) {
      throw new RangeError(`values[${i}] must be a finite number, got ${String(value)}`);
    }
    // value <= 0은 0, -0, 음수를 모두 거른다. 조화 평균은 양의 reciprocal만 정의된다.
    if (value <= 0) {
      throw new RangeError(`values[${i}] must be a positive number, got ${String(value)}`);
    }
    reciprocalSum += 1 / value;
    if (!Number.isFinite(reciprocalSum)) {
      throw new RangeError(`harmonic mean reciprocal sum must be finite, got ${String(reciprocalSum)} at index ${i}`);
    }
  }
  const result = length / reciprocalSum;
  if (!Number.isFinite(result)) {
    throw new RangeError(`harmonic mean must be finite, got ${String(result)}`);
  }
  return canonicalizeNegativeZero(result);
}
