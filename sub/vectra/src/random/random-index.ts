import { type RandomSource, random } from './random';

const MAX_COLLECTION_LENGTH = 0xffffffff;

const assertValidCollectionLength = (length: number): void => {
  if (!Number.isSafeInteger(length) || length < 0 || length > MAX_COLLECTION_LENGTH) {
    throw new RangeError('length must be a safe integer between 0 and 0xffffffff');
  }
};

/**
 * `0 <= index < length` 범위의 정수 index를 균등 분포로 선택한다.
 *
 * `length`가 0이면 선택할 index가 없으므로 `undefined`를 반환한다.
 *
 * @param length - 선택할 index range의 길이. `0..0xffffffff` safe integer여야 한다.
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 * @throws {RangeError} length가 유효한 collection length가 아니면 던진다.
 */
export const randomIndex = (length: number, rng?: RandomSource): number | undefined => {
  assertValidCollectionLength(length);
  if (length === 0) return undefined;

  return Math.floor(random(rng) * length);
};
