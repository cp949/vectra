/**
 * flat Float32Array를 XYObjectWritable 배열로 변환하여 out 컬렉션에 기록한다.
 *
 * zero-allocation buffer reuse를 위한 Into 함수다.
 */

import type { XYObjectWritable } from '../../types/index';

/**
 * `[x0, y0, x1, y1, ...]` 형태의 flat 좌표 Float32Array를 파싱하여 out 배열에 기록한다.
 *
 * - index 0부터 순서대로 out 요소를 덮어쓴다. out.length는 재설정하지 않는다.
 * - flat.length가 홀수이면 마지막 x 값(쌍이 없는 요소)을 무시한다.
 * - out 배열의 각 요소가 존재하면 x/y 필드를 덮어쓴다. 요소가 없으면 새 객체를 할당한다.
 * - float32 → float64 변환으로 실제 값이 float32 precision을 유지한다.
 *
 * @param out - 결과를 기록할 XYObjectWritable 배열
 * @param flat - `[x0, y0, x1, y1, ...]` 형태의 flat 좌표 Float32Array
 */
export function fromFloat32ArrayInto(out: XYObjectWritable[], flat: Float32Array): void {
  // 홀수 length여도 Math.floor로 완전한 쌍 수만 처리
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
