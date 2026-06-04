import { assertValuesArray, sumFiniteValues } from './validate.internal';

/**
 * `values`의 산술 평균을 반환한다.
 *
 * `values`는 readonly number 배열이어야 한다. array가 아니면 `TypeError`. 빈 배열은 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`. 누적 sum이 non-finite가 되면 `RangeError`.
 *
 * @param values 평균을 계산할 number 배열. finite entry로만 구성된다.
 */
export function mean(values: readonly number[]): number {
  assertValuesArray(values, 'values');
  const length = values.length;
  if (length === 0) {
    throw new RangeError('values must not be empty');
  }
  const sum = sumFiniteValues(values);
  // length >= 1 + sum finite에서 result는 항상 finite. 방어용 가드.
  const result = sum / length;
  if (!Number.isFinite(result)) {
    throw new RangeError(`mean must be finite, got ${String(result)}`);
  }
  return result;
}
