/**
 * XYInput 배열을 flat Float32Array로 변환하여 out 버퍼에 기록한다.
 *
 * zero-allocation buffer reuse를 위한 Into 함수다.
 */

import { readX, readY } from '../../internal/xy';
import type { XYInput } from '../../types/index';

/**
 * XYInput 배열을 `[x0, y0, x1, y1, ...]` 형태의 flat 좌표로 변환하여 Float32Array out에 기록한다.
 *
 * - index 0부터 순서대로 덮어쓴다.
 * - **경고**: out.length < points.length * 2이면 범위 밖 쓰기가 silently 무시된다. 데이터 손실 발생.
 *   out.length >= points.length * 2를 반드시 보장해야 한다.
 * - float64 → float32 변환으로 정밀도가 손실될 수 있다.
 * - 렌더러 파이프라인에서 매 프레임 동일 buffer를 재사용할 때 사용한다.
 *
 * @param out - 결과를 기록할 Float32Array (index 0부터 덮어씀)
 * @param points - 변환할 XYInput 배열
 */
export function toFloat32ArrayInto(out: Float32Array, points: readonly XYInput[]): void {
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    out[i * 2] = readX(p);
    out[i * 2 + 1] = readY(p);
  }
}
