import { readPolygonPoints } from '../internal/polygon';
import type { PolygonLike } from '../types';

/**
 * polygon의 닫힌 edge 수를 반환한다.
 *
 * 마지막 point → 첫 point를 잇는 edge를 포함한다.
 * pointCount >= 2이면 pointCount, pointCount < 2이면 0을 반환한다.
 *
 * @param polygon edge 수를 반환할 polygon
 */
export function edgeCount(polygon: PolygonLike): number {
  const pts = readPolygonPoints(polygon);
  return pts.length >= 2 ? pts.length : 0;
}
