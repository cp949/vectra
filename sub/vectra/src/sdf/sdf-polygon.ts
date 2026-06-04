import { polygonBoundaryDistance, polygonContainsPoint, readPolygonPoints } from '../internal/polygon';
import { readX, readY } from '../internal/xy';
import type { PolygonLike, XYInput } from '../types';
import { canonicalizeZero, requireFinitePoints, requireFiniteX, requireFiniteY } from './primitive.internal';

/**
 * polygon과 point 사이의 signed distance를 반환한다.
 *
 * `points.length >= 3`은 boundary까지의 거리에 containment sign을 적용한다. interior는 음수,
 * boundary는 0, exterior는 양수다. sign은 ray casting(`polygonContainsPoint`, epsilon 0) 결과를
 * 따르며 winding에 의존하지 않는다. self-intersecting polygon은 repair하지 않고 ray casting 결과를
 * 그대로 쓴다.
 *
 * `points.length === 1`은 해당 point까지의 거리, `points.length === 2`는 segment까지의 거리이며
 * interior 음수 영역이 없다. repeated-point edge(zero-length segment)는 `NaN`을 만들지 않는다.
 *
 * 모든 vertex 좌표와 point 좌표는 finite여야 한다. `points.length === 0`은 boundary가 없으므로
 * `RangeError`, non-finite vertex/point 좌표도 `RangeError`다.
 *
 * @param polygon signed distance를 측정할 polygon
 * @param point polygon까지의 signed distance를 측정할 point
 */
export function sdfPolygon(polygon: PolygonLike, point: XYInput): number {
  const pts = readPolygonPoints(polygon);
  const n = pts.length;
  if (n === 0) {
    throw new RangeError('sdf polygon must have at least one vertex, got 0');
  }
  requireFinitePoints(pts, 'polygon vertex');
  const px = requireFiniteX(point, 'point');
  const py = requireFiniteY(point, 'point');

  if (n === 1) {
    return canonicalizeZero(Math.hypot(readX(pts[0]) - px, readY(pts[0]) - py));
  }

  const boundary = polygonBoundaryDistance(pts, px, py, null);

  // segment(두 vertex)는 interior가 없으므로 unsigned boundary distance만 반환한다.
  if (n === 2) return canonicalizeZero(boundary);

  // boundary 위 point는 sign이 없는 0이다.
  if (boundary === 0) return 0;

  return polygonContainsPoint(pts, px, py, 0) ? -boundary : boundary;
}
