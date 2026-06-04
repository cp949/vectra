import { type RandomSource, random } from './random';

const MAX_COLLECTION_LENGTH = 0xffffffff;

/**
 * 배열에서 replacement 없이 정확히 count개 항목을 뽑아 out에 기록한다.
 *
 * 입력 snapshot을 먼저 만들기 때문에 `out === items` aliasing도 안전하게 허용한다.
 * count > items.length이면 RangeError를 던진다(sample과 달리 clamp하지 않는다).
 * count === 0이면 out.length = 0 후 빈 out을 반환한다.
 * count는 0 이상 0xffffffff 이하의 safe integer여야 한다.
 *
 * @param out 결과를 기록할 배열. 기존 내용은 제거된다.
 * @param items 샘플링 대상 배열. 읽기 전용.
 * @param count 선택할 항목 수. 정확히 count개를 반환한다.
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 */
export function pickUniqueInto<T, Out extends T[]>(
  out: Out,
  items: readonly T[],
  count: number,
  rng?: RandomSource
): Out {
  if (!Number.isSafeInteger(count) || count < 0 || count > MAX_COLLECTION_LENGTH) {
    throw new RangeError('pickUniqueInto count must be a safe integer between 0 and 0xffffffff');
  }

  if (count > items.length) {
    throw new RangeError('pickUniqueInto count must not exceed items.length');
  }

  const snapshot = Array.from(items);
  out.length = 0;

  if (count === 0) return out;

  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(random(rng) * (snapshot.length - i));
    const temp = snapshot[i] as T;
    snapshot[i] = snapshot[j] as T;
    snapshot[j] = temp;
    out.push(snapshot[i] as T);
  }

  return out;
}
