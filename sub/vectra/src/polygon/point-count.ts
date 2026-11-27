import type { Polygon } from '../types/flat-shapes.internal';

/**
 * polygon의 vertex 수를 반환한다.
 *
 * @param polygon vertex 수를 반환할 polygon
 */
export function pointCount(polygon: Polygon): number {
  return polygon.length / 2;
}
