import type { Polygon } from '../types/flat-shapes.internal';

/**
 * polygon의 닫힌 edge 수를 반환한다.
 *
 * 마지막 point → 첫 point를 잇는 edge를 포함한다.
 * pointCount >= 2이면 pointCount, pointCount < 2이면 0을 반환한다.
 *
 * @param polygon edge 수를 반환할 polygon
 */
export function edgeCount(polygon: Polygon): number {
  return polygon.length >= 4 ? polygon.length / 2 : 0;
}
