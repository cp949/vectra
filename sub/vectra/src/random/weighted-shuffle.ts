import { type RandomSource, random } from './random';

/**
 * Efraimidis-Spirakis 알고리즘으로 가중치 기반 without-replacement 순서를 반환한다.
 *
 * positive weight 항목은 `Math.log(u) / weight` key를 기준으로 내림차순 정렬된다.
 * zero weight 항목은 positive weight 항목 뒤에 input 순서 그대로 추가된다.
 * 모든 weight가 0이면 input 순서 copy를 반환한다.
 * 빈 배열은 빈 배열을 반환한다.
 *
 * `items`와 `weights`는 mutate하지 않는다.
 * `items.length !== weights.length`이면 `RangeError`를 던진다.
 * 음수 또는 non-finite weight가 있으면 `RangeError`를 던진다.
 * `rng`가 음수를 반환하면 `Math.log` 결과가 `NaN`이 되어 해당 항목의 정렬 위치는 implementation-defined다.
 *
 * @param items - 셔플 대상 배열. 읽기 전용.
 * @param weights - 각 항목의 가중치. `items`와 길이가 같아야 한다. 음수 또는 non-finite 금지.
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 * @throws {RangeError} 길이 불일치 또는 유효하지 않은 가중치가 있으면 던진다.
 */
export const weightedShuffle = <T>(items: readonly T[], weights: readonly number[], rng?: RandomSource): T[] => {
  if (items.length !== weights.length) {
    throw new RangeError('items and weights must have the same length');
  }

  for (const w of weights) {
    if (!Number.isFinite(w) || w < 0) {
      throw new RangeError('weights must be non-negative finite numbers');
    }
  }

  const positiveEntries: Array<{ index: number; key: number }> = [];
  const zeroIndices: number[] = [];

  for (let i = 0; i < items.length; i++) {
    const w = weights[i] as number;
    if (w > 0) {
      const u = random(rng);
      // Efraimidis-Spirakis key: log(u) / w. u === 0이면 key = -Infinity.
      positiveEntries.push({ index: i, key: Math.log(u) / w });
    } else {
      zeroIndices.push(i);
    }
  }

  // key 내림차순 정렬로 weight 높은 항목이 앞에 오게 한다.
  positiveEntries.sort((a, b) => b.key - a.key);

  const result: T[] = [];
  for (const { index } of positiveEntries) result.push(items[index] as T);
  for (const index of zeroIndices) result.push(items[index] as T);
  return result;
};
