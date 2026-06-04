/**
 * flat number 배열을 XYObjectWritable 배열로 decode해 out 컬렉션에 기록한다.
 *
 * tolerant decode 함수. zero-allocation buffer reuse를 위한 Into 함수다.
 */

import type { XYObjectWritable } from '../../types/index';

/**
 * `[x0, y0, x1, y1, ...]` 형태의 flat 좌표 배열을 decode해 out 배열에 기록한다.
 *
 * - index 0부터 순서대로 out 요소를 덮어쓴다. out.length는 재설정하지 않는다.
 * - flat.length가 홀수이면 마지막 x 값(쌍이 없는 요소)을 무시한다.
 * - out 배열의 각 요소가 존재하면 x/y 필드를 덮어쓴다. 요소가 없으면 새 객체를 할당한다.
 *
 * @param out - 결과를 기록할 XYObjectWritable 배열
 * @param flat - `[x0, y0, x1, y1, ...]` 형태의 flat 좌표 number 배열
 */
export function decodeFlatCoordsInto(out: XYObjectWritable[], flat: readonly number[]): void {
  // 홀수 길이이면 Math.floor로 완전한 쌍 수만 처리
  const count = Math.floor(flat.length / 2);
  for (let i = 0; i < count; i++) {
    const x = flat[i * 2];
    const y = flat[i * 2 + 1];
    if (i < out.length) {
      out[i].x = x;
      out[i].y = y;
    } else {
      out[i] = { x, y };
    }
  }
}
