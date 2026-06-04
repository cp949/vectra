import type { XYObjectWritable } from '../../types/index';
import { fromFloat32ArrayInto } from './from-float32-array-into';

/**
 * `[x0, y0, x1, y1, ...]` 형태의 flat 좌표 Float32Array를 파싱하여 새 배열로 반환한다.
 *
 * - 새 `{ x, y }` object 배열을 할당하여 반환한다.
 * - buffer 재사용이 필요하면 {@link fromFloat32ArrayInto}를 사용한다.
 * - flat.length가 홀수이면 마지막 x 값(쌍이 없는 요소)을 무시한다.
 * - float32 → float64 변환으로 실제 값이 float32 precision을 유지한다.
 *
 * @param flat - `[x0, y0, x1, y1, ...]` 형태의 flat 좌표 Float32Array
 * @returns decode된 `{ x, y }` 배열
 */
export function fromFloat32Array(flat: Float32Array): { x: number; y: number }[] {
  const out: XYObjectWritable[] = [];
  fromFloat32ArrayInto(out, flat);
  return out;
}
