import { type RandomSource, random } from './random';

/**
 * 가중치 기반으로 배열에서 항목 하나를 무작위 선택해 반환한다.
 *
 * `items`와 `weights`의 길이가 다르면 `RangeError`를 던진다.
 * 음수 또는 non-finite weight가 있으면 `RangeError`를 던진다.
 * zero weight 항목은 허용하되 선택 대상에서 제외된다.
 * positive weight 합계가 0이면 `undefined`를 반환한다.
 *
 * @param items - 선택 대상 배열. 읽기 전용.
 * @param weights - 각 항목의 가중치 배열. `items`와 길이가 같아야 한다.
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 * @throws {RangeError} 길이 불일치 또는 유효하지 않은 가중치가 있으면 던진다.
 */
export const weightedChoice = <T>(
  items: readonly T[],
  weights: readonly number[],
  rng?: RandomSource
): T | undefined => {
  if (items.length !== weights.length) {
    throw new RangeError('items and weights must have the same length');
  }

  let totalWeight = 0;
  for (const w of weights) {
    if (!Number.isFinite(w) || w < 0) {
      throw new RangeError('weights must be non-negative finite numbers');
    }
    totalWeight += w;
  }

  if (totalWeight === 0) return undefined;

  const threshold = random(rng) * totalWeight;
  let cumulative = 0;
  for (let i = 0; i < items.length; i++) {
    cumulative += weights[i] as number;
    if (threshold < cumulative) {
      return items[i];
    }
  }

  // floating-point 오차 보정: 마지막 non-zero weight 항목 반환
  for (let i = items.length - 1; i >= 0; i--) {
    if ((weights[i] as number) > 0) {
      return items[i];
    }
  }

  return undefined;
};
