/**
 * XYInput 배열을 flat Float32Array로 변환하여 새 배열을 반환한다.
 *
 * toFloat32ArrayInto의 allocating convenience 함수다.
 */

import type { XYInput } from '../../types/index';
import { toFloat32ArrayInto } from './to-float32-array-into';

/**
 * XYInput 배열을 `[x0, y0, x1, y1, ...]` 형태의 flat 좌표 Float32Array로 변환한다.
 *
 * - 새 Float32Array를 할당하여 반환한다.
 * - float64 → float32 변환으로 정밀도가 손실될 수 있다.
 * - buffer 재사용이 필요하면 {@link toFloat32ArrayInto}를 사용한다.
 *
 *
 * caller-responsibility 가정은 `toFloat32ArrayInto`와 동일하다.
 * @param points - 변환할 XYInput 배열
 * @returns `[x0, y0, x1, y1, ...]` 형태의 Float32Array
 */
export function toFloat32Array(points: readonly XYInput[]): Float32Array {
  const out = new Float32Array(points.length * 2);
  toFloat32ArrayInto(out, points);
  return out;
}
