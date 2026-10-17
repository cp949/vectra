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

/**
 * `values`의 centered delta 제곱합만 계산한다. deltas 배열을 할당하지 않는다.
 *
 * `computeMeanWithSquaredSum(values).squaredSum`과 같은 값, 같은 `RangeError`(메시지, 검사 순서)를
 * 낸다. deltas가 필요 없는 caller(예: `variance`)가 쓴다. caller는 호출 전 `values`가 array이며
 * `values.length >= 1`임을 보장한다.
 *
 * `computeMeanWithSquaredSum`과 본문이 같다. 공통 helper로 합치면 deltas 경로(`standardize`,
 * `skewness`, `kurtosis`)가 느려져 복제했다. 한쪽을 고치면 다른 쪽도 고쳐야 하고,
 * `mean-squared-sum-internal.test.ts`가 두 결과의 일치를 검증한다.
 *
 * @param values 제곱합을 계산할 number 배열.
 * @returns 제곱합.
 */
export function computeSquaredSum(values: readonly number[]): number {
  const length = values.length;
  const sum = sumFiniteValues(values);
  // length >= 1 + sum finite에서 result는 항상 finite. 방어용 가드.
  const meanValue = sum / length;
  if (!Number.isFinite(meanValue)) {
    throw new RangeError(`mean must be finite, got ${String(meanValue)}`);
  }
  let squaredSum = 0;
  for (let i = 0; i < length; i++) {
    const delta = values[i] - meanValue;
    if (!Number.isFinite(delta)) {
      throw new RangeError(`centered entry at index ${i} must be finite, got ${String(delta)}`);
    }
    const squared = delta * delta;
    if (!Number.isFinite(squared)) {
      throw new RangeError(`squared delta at index ${i} must be finite, got ${String(squared)}`);
    }
    squaredSum += squared;
    if (!Number.isFinite(squaredSum)) {
      throw new RangeError(`squared sum must be finite, got ${String(squaredSum)} at index ${i}`);
    }
  }
  return squaredSum;
}
