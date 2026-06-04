/**
 * XYInput 배열을 flat number 배열로 변환하여 새 배열을 반환한다.
 *
 * toFlatCoordsInto의 allocating convenience 함수다.
 */

import type { XYInput } from '../../types/index';
import { toFlatCoordsInto } from './to-flat-coords-into';

/**
 * XYInput 배열을 `[x0, y0, x1, y1, ...]` 형태의 flat 좌표 number 배열로 변환한다.
 *
 * - 새 number[] 배열을 할당하여 반환한다.
 * - buffer 재사용이 필요하면 {@link toFlatCoordsInto}를 사용한다.
 *
 * @param points - 변환할 XYInput 배열
 * @returns `[x0, y0, x1, y1, ...]` 형태의 number 배열
 */
export function toFlatCoords(points: readonly XYInput[]): number[] {
  const out: number[] = new Array(points.length * 2);
  toFlatCoordsInto(out, points);
  return out;
}
