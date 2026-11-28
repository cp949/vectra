import { lineFamilyPolygonIntersectionHitsInto } from '../internal/polygon-line-intersections';
import type { LinePolygonIntersectionHit } from '../types';
import type { InfiniteLine, Polygon } from '../types/flat-shapes.internal';

/**
 * infinite-line과 polygon edge의 모든 교점을 outHits에 기록하고 같은 outHits를 반환한다.
 *
 * boolean `intersectsPolygonInfiniteLine`와 달리 교점 위치와 edge metadata를 보존한다.
 * 각 hit은 `LinePolygonIntersectionHit`이며 `point`=교점, `tLine`=infinite-line parameter(전체 범위),
 * `tEdge`=edge-local parameter `[0, 1]`, `edgeIndex`=polygon edge index, `kind`=edge-level 교차
 * 종류(`cross`/`touch`/`overlap`)다.
 *
 * - infinite-line은 range filter 없이 양방향 교점을 모두 포함한다.
 * - polygon vertex를 지나는 hit은 인접 edge 중복 없이 `kind: 'touch'` 하나로 dedupe된다.
 * - polygon edge와 collinear overlap이면 overlap 구간 양 끝점을 `kind: 'overlap'`으로 push한다.
 * - empty polygon(`좌표 수 < 6`)과 degenerate direction(`dx = dy = 0`)은 빈 배열이다.
 *
 * outHits는 먼저 clear되고 결과 hit이 infinite-line parameter `tLine` 오름차순으로 push된다. push되는
 * hit과 nested point는 매 호출 새 object이며 입력 point object를 재사용하지 않는다.
 * `epsilon`은 collinear/vertex dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 * infinite-line은 기준점 (ox, oy) 선택이 caller 임의라서 closest helper를 제공하지 않는다.
 *
 * @param outHits 교점을 기록할 배열. 기존 내용은 비우고 { point, kind, tLine, tEdge, edgeIndex }를 넣는다. point는 { x, y }다.
 * @param infiniteLine 교점을 구할 infinite-line
 * @param polygon 교점을 구할 polygon
 * @param epsilon collinear/dedupe 판정 임계값
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function infiniteLinePolygonIntersectionsInto(
  outHits: LinePolygonIntersectionHit[],
  infiniteLine: InfiniteLine,
  polygon: Polygon,
  epsilon?: number
): LinePolygonIntersectionHit[] {
  lineFamilyPolygonIntersectionHitsInto(
    outHits,
    infiniteLine.ox,
    infiniteLine.oy,
    infiniteLine.dx,
    infiniteLine.dy,
    'inf',
    polygon,
    epsilon
  );
  return outHits;
}
