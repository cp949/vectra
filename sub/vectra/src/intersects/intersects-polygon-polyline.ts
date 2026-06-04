import { DEFAULT_EPSILON } from '../internal/numeric';
import { polygonPolylineIntersects } from '../internal/polygon-relation';
import type { PolygonLike, PolylineLike } from '../types';

/**
 * polygon과 polyline이 교차하면 true를 반환한다.
 *
 * - polyline은 open path로 마지막 point에서 첫 point로 닫지 않는다.
 * - 판정 조건 (OR):
 *   1. polyline의 임의 point가 polygon 내부(경계 포함)에 있다.
 *   2. polyline segment와 polygon edge가 교차한다.
 * - polyline 전체가 polygon 내부에 완전히 포함된 경우: 첫 point containment로 true.
 * - collinear 꼭짓점, self-intersecting polygon도 동일한 규칙으로 판정한다.
 * - empty polygon (points.length < 3): false.
 * - empty polyline (points.length === 0): false.
 * - single-point polyline: point containment만 판정한다.
 *
 * @param polygon  교차를 검사할 polygon
 * @param polyline 교차를 검사할 polyline
 * @param epsilon  교차 판정 허용 오차
 */
export function intersectsPolygonPolyline(
  polygon: PolygonLike,
  polyline: PolylineLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  return polygonPolylineIntersects(polygon, polyline, epsilon);
}
