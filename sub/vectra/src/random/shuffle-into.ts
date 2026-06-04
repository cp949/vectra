import { type RandomSource, random } from './random';

/**
 * input의 snapshot을 만든 후 Fisher-Yates로 셔플한 결과를 out에 기록한다.
 *
 * `out`을 먼저 비우고(`out.length = 0`) shuffled copy를 채운다.
 * `out === items` aliasing도 안전하게 허용한다.
 *
 * @param out - 결과를 기록할 배열. 기존 내용은 제거된다.
 * @param items - 셔플 원본 배열. 읽기 전용.
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 */
export const shuffleInto = <T, Out extends T[]>(out: Out, items: readonly T[], rng?: RandomSource): Out => {
  // aliasing 대비 input snapshot을 먼저 생성
  const snapshot = Array.from(items);

  for (let i = snapshot.length - 1; i > 0; i--) {
    const j = Math.floor(random(rng) * (i + 1));
    const temp = snapshot[i] as T;
    snapshot[i] = snapshot[j] as T;
    snapshot[j] = temp;
  }

  out.length = 0;
  for (let k = 0; k < snapshot.length; k++) out.push(snapshot[k] as T);
  return out;
};
