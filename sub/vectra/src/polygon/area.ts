import type { Polygon } from '../types/flat-shapes.internal';
import { shoelace2x } from '../internal/polygon';

/**
 * polygon의 넓이를 반환한다.
 *
 * shoelace formula로 signed area를 계산하고 절댓값을 취한다.
 * empty polygon(pointCount < 3)은 0을 반환한다.
 *
 * @param polygon 넓이를 계산할 polygon
 */
export function area(polygon: Polygon): number {
  if (polygon.length < 6) return 0;
  return Math.abs(shoelace2x(polygon)) / 2;
}
