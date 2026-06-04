import { polylineTotalLength, readPolylinePoints } from '../internal/polyline';
import type { PolylineLike } from '../types';

/**
 * polyline의 전체 arclength를 반환한다.
 *
 * empty polyline과 single-point polyline은 0을 반환한다.
 *
 * @param polyline 길이를 측정할 polyline
 */
export function length(polyline: PolylineLike): number {
  return polylineTotalLength(readPolylinePoints(polyline));
}
