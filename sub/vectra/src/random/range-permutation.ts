import type { RandomSource } from './random';
import { rangePermutationInto } from './range-permutation-into';

/**
 * `0..length-1` integer range의 순열을 새 배열로 반환한다.
 *
 * @param length 순열로 만들 range의 길이. `0..0xffffffff` safe integer여야 한다.
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 * @throws {RangeError} length가 유효한 collection length가 아니면 던진다.
 */
export const rangePermutation = (length: number, rng?: RandomSource): number[] => rangePermutationInto([], length, rng);
