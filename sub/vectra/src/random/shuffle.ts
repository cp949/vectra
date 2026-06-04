import type { RandomSource } from './random';
import { shuffleInto } from './shuffle-into';

/**
 * input의 snapshot을 만든 후 Fisher-Yates로 셔플한 새 배열을 반환한다.
 *
 * input은 변경하지 않는다.
 *
 * @param items 셔플 원본 배열. 읽기 전용.
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 */
export const shuffle = <T>(items: readonly T[], rng?: RandomSource): T[] => shuffleInto([], items, rng);
