import { DEFAULT_EPSILON } from '../internal/numeric';
import { lineFamilyPolygonIntersectionHitsInto } from '../internal/polygon-line-intersections';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readX, readY } from '../internal/xy';
import type { LinePolygonIntersectionHit, PolygonLike, RayLike } from '../types';

/**
 * ray와 polygon edge의 모든 교점을 outHits에 기록하고 같은 outHits를 반환한다.
 *
 * boolean `intersectsPolygonRay`와 달리 교점 위치와 edge metadata를 보존한다.
 * 각 hit은 `LinePolygonIntersectionHit`이며 `point`=교점, `tLine`=ray parameter `[0, ∞)`,
 * `tEdge`=edge-local parameter `[0, 1]`, `edgeIndex`=polygon edge index, `kind`=edge-level 교차
 * 종류(`cross`/`touch`/`overlap`)다.
 *
 * - ray는 `tLine >= 0` 구간만 포함한다. ray 뒤쪽(`tLine < 0`) 교점은 제외한다.
 * - origin이 polygon 내부면 boundary exit hit만 반환한다(containment-only hit 없음).
 * - polygon vertex를 지나는 hit은 인접 edge 중복 없이 `kind: 'touch'` 하나로 dedupe된다.
 * - polygon edge와 collinear overlap이면 overlap 구간 양 끝점을 `kind: 'overlap'`으로 push한다.
 * - empty polygon(`points.length < 3`)과 degenerate ray direction(zero-length)은 빈 배열이다.
 *
 * outHits는 먼저 clear되고 결과 hit이 ray parameter `tLine` 오름차순으로 push된다. push되는 hit과
 * nested point는 매 호출 새 object이며 입력 point object를 재사용하지 않는다.
 * `epsilon`은 collinear/vertex dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param outHits 교점 hit을 기록할 output array (호출 전 내용은 비워진다)
 * @param ray 교점을 구할 ray
 * @param polygon 교점을 구할 polygon
 * @param epsilon collinear/dedupe 판정 임계값
 */
export function rayPolygonIntersectionsInto(
  outHits: LinePolygonIntersectionHit[],
  ray: RayLike,
  polygon: PolygonLike,
  epsilon = DEFAULT_EPSILON
): LinePolygonIntersectionHit[] {
  const origin = readRayOrigin(ray);
  const direction = readRayDirection(ray);
  return lineFamilyPolygonIntersectionHitsInto(
    outHits,
    readX(origin),
    readY(origin),
    readX(direction),
    readY(direction),
    'ray',
    polygon,
    epsilon
  );
}
