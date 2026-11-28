import { DEFAULT_EPSILON } from '../internal/numeric';
import type { LinePolygonIntersectionHit } from '../types';
import type { PointWritable, Polygon, Ray } from '../types/flat-shapes.internal';
import { closestRayPolygonIntersectionInto } from './closest-ray-polygon-intersection-into';

/**
 * ray와 polygon edge의 가장 가까운 교점을 새 hit으로 반환한다.
 *
 * `closestRayPolygonIntersectionInto`의 allocating companion이다.
 * `rayPolygonIntersections` collection의 첫 hit(ray parameter `tLine` 최소)과 같은 point/metadata를
 * 반환한다. overlap이 첫 hit이면 overlap 구간 시작점(`kind: 'overlap'`)을 반환한다.
 *
 * - ray는 `tLine >= 0` 구간만 본다. 시작점 (ox, oy)가 polygon 내부면 boundary exit hit을 반환한다.
 * - 교점이 없으면 `undefined`를 반환한다.
 * - empty polygon(`좌표 수 < 6`)과 degenerate ray(`dx = dy = 0`)도 `undefined`다.
 *
 * 반환 hit과 nested point는 매 호출 새 object이며 입력 point object를 재사용하지 않는다.
 * `epsilon`은 collinear/vertex dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param ray 교점을 구할 ray
 * @param polygon 교점을 구할 polygon
 * @param epsilon collinear/dedupe 판정 임계값
 */
export function closestRayPolygonIntersection(
  ray: Ray,
  polygon: Polygon,
  epsilon = DEFAULT_EPSILON
): LinePolygonIntersectionHit | undefined {
  const out: LinePolygonIntersectionHit = {
    point: { x: 0, y: 0 },
    kind: 'cross',
    tLine: 0,
    tEdge: 0,
    edgeIndex: 0,
  };
  return closestRayPolygonIntersectionInto(out, ray, polygon, epsilon) ? out : undefined;
}
