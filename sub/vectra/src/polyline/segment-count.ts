import { readPolylinePoints } from '../internal/polyline';
import type { PolylineLike } from '../types';

/**
 * polyline을 이루는 인접 point 쌍의 segment 개수를 반환한다.
 *
 * empty polyline과 single-point polyline은 0을 반환한다.
 *
 * @param polyline segment 개수를 셀 polyline
 */
export function segmentCount(polyline: PolylineLike): number {
  return Math.max(0, readPolylinePoints(polyline).length - 1);
}
