import { readPolygonPoints, shoelace2x } from '../internal/polygon';
import type { PolygonLike } from '../types';

/**
 * polygon의 point 순서가 clockwise인지 반환한다.
 *
 * signedArea < 0이면 true다. signedArea === 0이면 false다.
 * 좌표계 convention을 강제하지 않는다.
 *
 * @param polygon orientation을 확인할 polygon
 */
export function isClockwise(polygon: PolygonLike): boolean {
  const pts = readPolygonPoints(polygon);
  if (pts.length < 3) return false;
  return shoelace2x(pts) < 0;
}
