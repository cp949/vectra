import { type RandomSource, random } from './random';

const validateWeights = (weights: readonly number[]): number => {
  if (weights.length === 0) {
    throw new RangeError('weightedRandomIndex: weights는 빈 배열일 수 없다.');
  }

  let total = 0;
  for (const weight of weights) {
    if (!Number.isFinite(weight) || weight < 0) {
      throw new RangeError(`weightedRandomIndex: weight는 non-negative finite number여야 한다. 받은 값: ${weight}`);
    }
    total += weight;
    if (!Number.isFinite(total)) {
      throw new RangeError('weightedRandomIndex: weight 합계는 finite number여야 한다.');
    }
  }

  if (total <= 0) {
    throw new RangeError('weightedRandomIndex: weight 합계는 0보다 커야 한다.');
  }

  return total;
};

/**
 * 가중치 배열에서 weight 비율에 따라 index 하나를 선택한다.
 *
 * zero weight index는 선택 대상에서 제외된다. 빈 배열, 음수 weight, non-finite weight,
 * 합계 0은 `RangeError`를 던진다.
 *
 * @param weights index별 가중치 배열
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 */
export const weightedRandomIndex = (weights: readonly number[], rng?: RandomSource): number => {
  const total = validateWeights(weights);
  const threshold = random(rng) * total;
  let cumulative = 0;

  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i] as number;
    if (threshold < cumulative) {
      return i;
    }
  }

  // floating-point 오차 보정: 마지막 positive weight index 반환
  for (let i = weights.length - 1; i >= 0; i--) {
    if ((weights[i] as number) > 0) {
      return i;
    }
  }

  throw new RangeError('weightedRandomIndex: weight 합계는 0보다 커야 한다.');
};
