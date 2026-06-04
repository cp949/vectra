import { assertValuesArray } from './validate.internal';

/**
 * weighted mean과 함께 누적된 total weight, 누적 squared weight sum을 반환한다.
 *
 * `values`/`weights`는 같은 길이의 finite number 배열이어야 한다. array가 아니면 `TypeError`.
 * 빈 배열 또는 length mismatch는 `RangeError`. `values[i]`가 non-finite거나 `weights[i]`가
 * non-finite이거나 음수면 `RangeError`. 단일 패스로 각 entry, `weightedSum = Σ wᵢ·xᵢ`,
 * `totalWeight = Σ wᵢ`, `sumOfSquaredWeights = Σ wᵢ²`의 finite 여부를 매 step 검증한다.
 * `totalWeight === 0`이면 `RangeError`. `weightedMean = weightedSum / totalWeight`의 finite도
 * 검증한다.
 *
 * caller는 결과 `weightedMean`을 그대로 반환하거나 second pass에서 weighted variance를 산출할 때
 * `totalWeight`와 `sumOfSquaredWeights`를 denominator 계산에 재사용한다.
 *
 * @param values weighted statistics 입력 number 배열. finite entry로만 구성된다.
 * @param weights `values`와 같은 길이의 finite `>= 0` weight 배열.
 */
export function computeWeightedMean(
  values: readonly number[],
  weights: readonly number[]
): { weightedMean: number; totalWeight: number; sumOfSquaredWeights: number } {
  assertValuesArray(values, 'values');
  assertValuesArray(weights, 'weights');
  const length = values.length;
  if (length === 0) {
    throw new RangeError('values must not be empty');
  }
  if (weights.length !== length) {
    throw new RangeError(
      `weights.length must equal values.length, got weights.length=${weights.length}, values.length=${length}`
    );
  }
  let weightedSum = 0;
  let totalWeight = 0;
  let sumOfSquaredWeights = 0;
  for (let i = 0; i < length; i++) {
    const v = values[i];
    if (!Number.isFinite(v)) {
      throw new RangeError(`values[${i}] must be a finite number, got ${String(v)}`);
    }
    const w = weights[i];
    if (!Number.isFinite(w) || w < 0) {
      throw new RangeError(`weights[${i}] must be a finite number >= 0, got ${String(w)}`);
    }
    const weightedEntry = w * v;
    if (!Number.isFinite(weightedEntry)) {
      throw new RangeError(`weighted entry at index ${i} must be finite, got ${String(weightedEntry)}`);
    }
    weightedSum += weightedEntry;
    if (!Number.isFinite(weightedSum)) {
      throw new RangeError(`weightedSum must be finite, got ${String(weightedSum)} at index ${i}`);
    }
    totalWeight += w;
    if (!Number.isFinite(totalWeight)) {
      throw new RangeError(`totalWeight must be finite, got ${String(totalWeight)} at index ${i}`);
    }
    const weightSquared = w * w;
    if (!Number.isFinite(weightSquared)) {
      throw new RangeError(`squared weight at index ${i} must be finite, got ${String(weightSquared)}`);
    }
    sumOfSquaredWeights += weightSquared;
    if (!Number.isFinite(sumOfSquaredWeights)) {
      throw new RangeError(`sumOfSquaredWeights must be finite, got ${String(sumOfSquaredWeights)} at index ${i}`);
    }
  }
  if (totalWeight === 0) {
    throw new RangeError('totalWeight must be > 0');
  }
  const weightedMean = weightedSum / totalWeight;
  if (!Number.isFinite(weightedMean)) {
    throw new RangeError(`weightedMean must be finite, got ${String(weightedMean)}`);
  }
  return { weightedMean, totalWeight, sumOfSquaredWeights };
}
