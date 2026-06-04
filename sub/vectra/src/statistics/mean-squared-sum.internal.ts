import { sumFiniteValues } from './validate.internal';

/**
 * `values`의 평균, centered delta 배열, 제곱합을 한 번에 계산한다.
 *
 * 단계별 동작:
 *  1. `sumFiniteValues`로 entry finite와 누적 sum finite를 검증한다.
 *  2. `sum / length`로 평균을 계산하고 finite 여부를 방어 가드한다.
 *  3. 각 entry에 대해 `delta = value - mean`을 계산해 `deltas[i]`에 저장하고 finite를 검증한다.
 *  4. `delta * delta`가 finite한지, 누적 squared sum이 finite한지 매 step 검증한다.
 *
 * 어느 단계든 위반 시 `RangeError`. caller는 호출 전 `values`가 array이며 `values.length >= 1`임을
 * 보장한다.
 *
 * @param values 평균/centered delta/제곱합을 계산할 number 배열.
 * @returns `mean`, `deltas`, `squaredSum`.
 */
export function computeMeanWithSquaredSum(values: readonly number[]): {
  mean: number;
  deltas: number[];
  squaredSum: number;
} {
  const length = values.length;
  const sum = sumFiniteValues(values);
  // length >= 1 + sum finite에서 result는 항상 finite. 방어용 가드.
  const meanValue = sum / length;
  if (!Number.isFinite(meanValue)) {
    throw new RangeError(`mean must be finite, got ${String(meanValue)}`);
  }
  const deltas = new Array<number>(length);
  let squaredSum = 0;
  for (let i = 0; i < length; i++) {
    const delta = values[i] - meanValue;
    if (!Number.isFinite(delta)) {
      throw new RangeError(`centered entry at index ${i} must be finite, got ${String(delta)}`);
    }
    deltas[i] = delta;
    const squared = delta * delta;
    if (!Number.isFinite(squared)) {
      throw new RangeError(`squared delta at index ${i} must be finite, got ${String(squared)}`);
    }
    squaredSum += squared;
    if (!Number.isFinite(squaredSum)) {
      throw new RangeError(`squared sum must be finite, got ${String(squaredSum)} at index ${i}`);
    }
  }
  return { mean: meanValue, deltas, squaredSum };
}
