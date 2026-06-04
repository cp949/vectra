import { type RandomSource, random } from './random';

/**
 * 배열에서 균등 분포로 항목 하나를 무작위 선택해 반환한다.
 *
 * 빈 배열이면 `undefined`를 반환한다.
 *
 * @param items - 선택 대상 배열. 읽기 전용.
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 */
export const choice = <T>(items: readonly T[], rng?: RandomSource): T | undefined => {
  if (items.length === 0) return undefined;

  const index = Math.floor(random(rng) * items.length);
  return items[index];
};
