import { type RandomSource, random } from './random';

const MAX_COLLECTION_LENGTH = 0xffffffff;

/**
 * [0, max) 범위의 unique integer index를 count개 뽑아 out에 기록한다.
 *
 * Fisher-Yates shuffle 변형으로 구현한다.
 * count > max이면 RangeError를 던진다. count === 0이면 out.length = 0 후 빈 out을 반환한다.
 * count와 max는 0 이상 0xffffffff 이하의 safe integer여야 한다. 비정수이면 RangeError를 던진다.
 *
 * @param out 결과를 기록할 숫자 배열. 기존 내용은 제거된다.
 * @param count 선택할 index 수.
 * @param max index의 상한(exclusive). [0, max) 범위에서 뽑는다.
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 */
export function uniqueIndicesInto<Out extends number[]>(out: Out, count: number, max: number, rng?: RandomSource): Out {
  if (!Number.isSafeInteger(count) || count < 0 || count > MAX_COLLECTION_LENGTH) {
    throw new RangeError('uniqueIndicesInto count must be a safe integer between 0 and 0xffffffff');
  }

  if (!Number.isSafeInteger(max) || max < 0 || max > MAX_COLLECTION_LENGTH) {
    throw new RangeError('uniqueIndicesInto max must be a safe integer between 0 and 0xffffffff');
  }

  if (count > max) {
    throw new RangeError('uniqueIndicesInto count must not exceed max');
  }

  out.length = 0;

  if (count === 0) return out;

  // Fisher-Yates partial shuffle — indices 배열을 직접 구성해 partial shuffle
  const indices: number[] = [];
  for (let i = 0; i < max; i++) indices.push(i);

  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(random(rng) * (max - i));
    const temp = indices[i] as number;
    indices[i] = indices[j] as number;
    indices[j] = temp;
    out.push(indices[i] as number);
  }

  return out;
}
