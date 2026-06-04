import { canonicalizeNegativeZero } from './order-statistics.internal';
import { assertValuesArray } from './validate.internal';

/**
 * `values` entry의 누적 합을 반환한다.
 *
 * `values`는 readonly number 배열이어야 한다. array가 아니면 `TypeError`. 빈 배열은 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`. 단일 패스로 entry finite 여부와
 * 누적 sum의 finite 여부를 매 step 함께 검증한다. 위반 시 `RangeError`. 결과의 `-0`은 `0`으로
 * canonicalize한다. input 배열은 mutate하지 않는다.
 *
 * @param values 합을 계산할 number 배열. finite entry로만 구성된다.
 */
export function sum(values: readonly number[]): number {
  assertValuesArray(values, 'values');
  const length = values.length;
  if (length === 0) {
    throw new RangeError('values must not be empty');
  }
  let result = 0;
  for (let i = 0; i < length; i++) {
    const value = values[i];
    if (!Number.isFinite(value)) {
      throw new RangeError(`values[${i}] must be a finite number, got ${String(value)}`);
    }
    result += value;
    if (!Number.isFinite(result)) {
      throw new RangeError(`sum must be finite, got ${String(result)} at index ${i}`);
    }
  }
  return canonicalizeNegativeZero(result);
}
