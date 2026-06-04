import { assertNonEmptyFiniteValues } from './aggregate.internal';
import { canonicalizeNegativeZero } from './order-statistics.internal';

/**
 * `values`의 최댓값과 최솟값 차이를 반환한다.
 *
 * `values`는 readonly number 배열이어야 한다. array가 아니면 `TypeError`. 빈 배열은 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`. 단일 패스로 minimum과 maximum을
 * 동시에 계산한 뒤 `max - min`이 finite임을 검증한다. 위반 시 `RangeError`. 결과는 항상 비음수다.
 * 결과의 `-0`은 `0`으로 canonicalize한다. input 배열은 mutate하지 않는다.
 *
 * @param values range를 계산할 number 배열. finite entry로만 구성된다.
 */
export function range(values: readonly number[]): number {
  assertNonEmptyFiniteValues(values, 'values');
  let minValue = values[0];
  let maxValue = values[0];
  for (let i = 1; i < values.length; i++) {
    const value = values[i];
    if (value < minValue) {
      minValue = value;
    }
    if (value > maxValue) {
      maxValue = value;
    }
  }
  const result = maxValue - minValue;
  if (!Number.isFinite(result)) {
    throw new RangeError(`range must be finite, got ${String(result)}`);
  }
  return canonicalizeNegativeZero(result);
}
