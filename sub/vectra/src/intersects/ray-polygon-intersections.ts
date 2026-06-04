import { DEFAULT_EPSILON } from '../internal/numeric';
import type { LinePolygonIntersectionHit, PolygonLike, RayLike } from '../types';
import { rayPolygonIntersectionsInto } from './ray-polygon-intersections-into';

/**
 * ray와 polygon edge의 모든 교점을 새 배열로 반환한다.
 *
 * `rayPolygonIntersectionsInto`의 allocating companion이다. 각 hit은 `LinePolygonIntersectionHit`이며
 * `point`=교점, `tLine`=ray parameter `[0, ∞)`, `tEdge`=edge-local parameter `[0, 1]`,
 * `edgeIndex`=polygon edge index, `kind`=edge-level 교차 종류(`cross`/`touch`/`overlap`)다.
 *
 * - ray는 `tLine >= 0` 구간만 포함한다. ray 뒤쪽(`tLine < 0`) 교점은 제외한다.
 * - origin이 polygon 내부면 boundary exit hit만 반환한다(containment-only hit 없음).
 * - polygon vertex를 지나는 hit은 인접 edge 중복 없이 `kind: 'touch'` 하나로 dedupe된다.
 * - polygon edge와 collinear overlap이면 overlap 구간 양 끝점을 `kind: 'overlap'`으로 반환한다.
 * - empty polygon(`points.length < 3`)과 degenerate ray direction(zero-length)은 빈 배열이다.
 *
 * 결과 hit은 ray parameter `tLine` 오름차순이다. 반환 hit과 nested point는 매 호출 새 object이며
 * 입력 point object를 재사용하지 않는다.
 * `epsilon`은 collinear/vertex dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param ray 교점을 구할 ray
 * @param polygon 교점을 구할 polygon
 * @param epsilon collinear/dedupe 판정 임계값
 */
export function rayPolygonIntersections(
  ray: RayLike,
  polygon: PolygonLike,
  epsilon = DEFAULT_EPSILON
): LinePolygonIntersectionHit[] {
  const out: LinePolygonIntersectionHit[] = [];
  rayPolygonIntersectionsInto(out, ray, polygon, epsilon);
  return out;
}
