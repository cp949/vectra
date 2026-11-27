import { polylineTotalLength } from '../internal/polyline';
import type { Polyline } from '../types/flat-shapes.internal';

/**
 * polyline의 전체 arclength를 반환한다.
 *
 * empty polyline과 single-point polyline은 0을 반환한다.
 *
 * @param polyline 길이를 측정할 polyline
 */
export function length(polyline: Polyline): number {
  return polylineTotalLength(polyline);
}
