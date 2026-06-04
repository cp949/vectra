import { readPolygonPoints, shoelace2x } from '../internal/polygon';
import type { PolygonLike } from '../types';

/**
 * polygon의 signed area를 반환한다.
 *
 * shoelace formula를 사용한다. 좌표계 convention을 강제하지 않고 입력 point 순서의 부호를 그대로 반환한다.
 * empty polygon(pointCount < 3)은 0을 반환한다.
 *
 * @param polygon signed area를 계산할 polygon
 */
export function signedArea(polygon: PolygonLike): number {
  const pts = readPolygonPoints(polygon);
  if (pts.length < 3) return 0;
  return shoelace2x(pts) / 2;
}
