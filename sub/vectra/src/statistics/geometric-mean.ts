import { canonicalizeNegativeZero } from './order-statistics.internal';
import { assertValuesArray } from './validate.internal';

/**
 * `values` entry의 기하 평균을 반환한다.
 *
 * `values`는 readonly number 배열이어야 한다. array가 아니면 `TypeError`. 빈 배열은 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`. 음수 entry는 `RangeError`. entry에 `0`이
 * 포함되면 기하 평균 정의대로 결과는 `0`이다(`-0` 포함, `+0`으로 canonicalize). overflow를 완화하기
 * 위해 곱이 아니라 log-sum 평균(`exp(Σ ln xᵢ / n)`)으로 계산한다. log-sum 또는 최종 결과가 non-finite면
 * `RangeError`. 결과의 `-0`은 `0`으로 canonicalize한다. input 배열은 mutate하지 않는다.
 *
 * @param values 기하 평균을 계산할 number 배열. finite, 음이 아닌 entry로만 구성된다.
 */
export function geometricMean(values: readonly number[]): number {
  assertValuesArray(values, 'values');
  const length = values.length;
  if (length === 0) {
    throw new RangeError('values must not be empty');
  }
  let hasZero = false;
  let logSum = 0;
  for (let i = 0; i < length; i++) {
    const value = values[i];
    if (!Number.isFinite(value)) {
      throw new RangeError(`values[${i}] must be a finite number, got ${String(value)}`);
    }
    if (value < 0) {
      throw new RangeError(`values[${i}] must be non-negative, got ${String(value)}`);
    }
    if (value === 0) {
      // 기하 평균 정의상 0이 하나라도 있으면 결과는 0. 나머지 entry도 finite/non-negative를
      // 검증하기 위해 early return하지 않고 flag만 둔다.
      hasZero = true;
      continue;
    }
    logSum += Math.log(value);
    if (!Number.isFinite(logSum)) {
      throw new RangeError(`geometric mean log-sum must be finite, got ${String(logSum)} at index ${i}`);
    }
  }
  if (hasZero) {
    return 0;
  }
  const result = Math.exp(logSum / length);
  if (!Number.isFinite(result)) {
    throw new RangeError(`geometric mean must be finite, got ${String(result)}`);
  }
  return canonicalizeNegativeZero(result);
}
