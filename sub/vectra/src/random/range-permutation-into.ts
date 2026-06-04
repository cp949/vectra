import { type RandomSource, random } from './random';

const MAX_COLLECTION_LENGTH = 0xffffffff;

const assertValidCollectionLength = (length: number): void => {
  if (!Number.isSafeInteger(length) || length < 0 || length > MAX_COLLECTION_LENGTH) {
    throw new RangeError('length must be a safe integer between 0 and 0xffffffff');
  }
};

/**
 * `0..length-1` integer range의 순열을 `out`에 기록한다.
 *
 * 유효성 검사를 통과하면 `out.length = 0`으로 비운 뒤 range 값을 채우고 Fisher-Yates로 섞는다.
 *
 * @param out - 결과를 기록할 숫자 배열. 기존 내용은 제거된다.
 * @param length - 순열로 만들 range의 길이. `0..0xffffffff` safe integer여야 한다.
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 * @throws {RangeError} length가 유효한 collection length가 아니면 던진다.
 */
export const rangePermutationInto = <Out extends number[]>(out: Out, length: number, rng?: RandomSource): Out => {
  assertValidCollectionLength(length);

  out.length = 0;
  for (let i = 0; i < length; i++) out.push(i);

  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random(rng) * (i + 1));
    const temp = out[i] as number;
    out[i] = out[j] as number;
    out[j] = temp;
  }

  return out;
};
