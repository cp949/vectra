import { pickUniqueInto } from './pick-unique-into';
import type { RandomSource } from './random';

/**
 * 배열에서 replacement 없이 정확히 count개 항목을 뽑아 새 배열로 반환한다.
 *
 * count > items.length이면 RangeError를 던진다(sample과 달리 clamp하지 않는다).
 * count === 0이면 빈 배열을 반환한다.
 * count는 0 이상 0xffffffff 이하의 safe integer여야 한다.
 *
 * @param items 샘플링 대상 배열. 읽기 전용.
 * @param count 선택할 항목 수. 정확히 count개를 반환한다.
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 */
export function pickUnique<T>(items: readonly T[], count: number, rng?: RandomSource): T[] {
  return pickUniqueInto([], items, count, rng);
}
