import type { Polygon } from '../types/flat-shapes.internal';
import { shoelace2x } from '../internal/polygon';

/**
 * polygon의 point 순서가 counter-clockwise인지 반환한다.
 *
 * signedArea > 0이면 true다. signedArea === 0이면 false다.
 * 좌표계 convention을 강제하지 않는다.
 *
 * @param polygon orientation을 확인할 polygon
 */
export function isCounterClockwise(polygon: Polygon): boolean {
  if (polygon.length < 6) return false;
  return shoelace2x(polygon) > 0;
}
