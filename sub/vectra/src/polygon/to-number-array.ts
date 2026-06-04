import type { PolygonLike } from '../types';
import { toNumberArrayInto } from './to-number-array-into';

/**
 * polygon vertex를 `[x0, y0, x1, y1, ...]` flat coordinate number 배열로 반환한다.
 *
 * output-only serialization helper다. 0개 point면 빈 배열을 반환한다.
 * 좌표 finite 여부를 검사하지 않고 그대로 기록한다(non-finite pass-through). `-0`도 canonicalize하지 않는다.
 *
 * @param polygon vertex를 읽을 polygon
 */
export function toNumberArray(polygon: PolygonLike): number[] {
  return toNumberArrayInto([], polygon);
}
