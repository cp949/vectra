import { type RandomSource, random } from './random';

const MAX_COLLECTION_LENGTH = 0xffffffff;

const assertValidSampleCount = (count: number): void => {
  if (!Number.isSafeInteger(count) || count < 0 || count > MAX_COLLECTION_LENGTH) {
    throw new RangeError('count must be a safe integer between 0 and 0xffffffff');
  }
};

/**
 * 배열에서 replacement 없이 최대 `count`개 항목을 뽑아 `out`에 기록한다.
 *
 * 입력 snapshot을 먼저 만들기 때문에 `out === items` aliasing도 안전하게 허용한다.
 * 유효성 검사를 통과하면 `out.length = 0`으로 비운 뒤 선택된 항목을 `push`한다.
 *
 * @param out - 결과를 기록할 배열. 기존 내용은 제거된다.
 * @param items - 샘플링 대상 배열. 읽기 전용.
 * @param count - 선택할 최대 항목 수. `0..0xffffffff` safe integer여야 한다.
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 * @throws {RangeError} count가 유효한 sample count가 아니면 던진다.
 */
export const sampleInto = <T, Out extends T[]>(
  out: Out,
  items: readonly T[],
  count: number,
  rng?: RandomSource
): Out => {
  assertValidSampleCount(count);

  const snapshot = Array.from(items);
  const limit = Math.min(count, snapshot.length);

  out.length = 0;
  for (let i = 0; i < limit; i++) {
    const j = i + Math.floor(random(rng) * (snapshot.length - i));
    const temp = snapshot[i] as T;
    snapshot[i] = snapshot[j] as T;
    snapshot[j] = temp;
    out.push(snapshot[i] as T);
  }

  return out;
};
