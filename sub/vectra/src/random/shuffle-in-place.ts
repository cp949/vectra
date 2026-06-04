import { type RandomSource, random } from './random';

/**
 * Fisher-Yates 알고리즘으로 배열을 제자리에서 무작위 순서로 재배치한다.
 *
 * 원본 배열을 직접 mutate하고 같은 배열 reference를 반환한다.
 *
 * @param items - 셔플 대상 배열. 직접 mutate된다.
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 */
export const shuffleInPlace = <T>(items: T[], rng?: RandomSource): T[] => {
  // Fisher-Yates: 뒤에서부터 무작위 위치와 교환
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random(rng) * (i + 1));
    // 두 인덱스 항목을 교환
    const temp = items[i] as T;
    items[i] = items[j] as T;
    items[j] = temp;
  }
  return items;
};
