import { readPolygonPoints } from '../internal/polygon';
import type { PolygonLike } from '../types';

/**
 * polygon의 vertex 수를 반환한다.
 *
 * @param polygon vertex 수를 반환할 polygon
 */
export function pointCount(polygon: PolygonLike): number {
  return readPolygonPoints(polygon).length;
}
