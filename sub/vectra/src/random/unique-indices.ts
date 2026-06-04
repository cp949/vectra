import type { RandomSource } from './random';
import { uniqueIndicesInto } from './unique-indices-into';

/**
 * [0, max) 범위의 unique integer index를 count개 뽑아 새 배열로 반환한다.
 *
 * count > max이면 RangeError를 던진다. count === 0이면 빈 배열을 반환한다.
 * count와 max는 0 이상 0xffffffff 이하의 safe integer여야 한다. 비정수이면 RangeError를 던진다.
 *
 * @param count 선택할 index 수.
 * @param max index의 상한(exclusive). [0, max) 범위에서 뽑는다.
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 */
export function uniqueIndices(count: number, max: number, rng?: RandomSource): number[] {
  return uniqueIndicesInto([], count, max, rng);
}
