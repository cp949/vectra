import type { RandomSource } from './random';
import { rangePermutationInto } from './range-permutation-into';
import { shuffleInto } from './shuffle-into';

/**
 * number input은 `0..arrayOrLength-1` 정수 순열을, array input은 셔플된 원소 순열을 새 배열로 반환한다.
 *
 * array input은 mutate하지 않는다.
 *
 * @param arrayOrLength - 순열로 만들 length 또는 셔플 원본 배열. 읽기 전용.
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 * @throws {RangeError} number input이고 `0..0xffffffff` 범위의 safe integer가 아니면 던진다.
 */
export function permutation(arrayOrLength: number, rng?: RandomSource): number[];
export function permutation<T>(arrayOrLength: readonly T[], rng?: RandomSource): T[];
export function permutation<T>(arrayOrLength: number | readonly T[], rng?: RandomSource): number[] | T[] {
  if (typeof arrayOrLength === 'number') {
    return rangePermutationInto([], arrayOrLength, rng);
  }
  return shuffleInto([], arrayOrLength, rng);
}
