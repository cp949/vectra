import { DEFAULT_EPSILON } from '../internal/numeric';
import type { LinePolygonIntersectionHit, PolygonLike, SegmentLike } from '../types';
import { segmentPolygonIntersectionsInto } from './segment-polygon-intersections-into';

/**
 * segment와 polygon edge의 모든 교점을 새 배열로 반환한다.
 *
 * `segmentPolygonIntersectionsInto`의 allocating companion이다. 각 hit은 `LinePolygonIntersectionHit`이며
 * `point`=교점, `tLine`=segment parameter `[0, 1]`, `tEdge`=edge-local parameter `[0, 1]`,
 * `edgeIndex`=polygon edge index, `kind`=edge-level 교차 종류(`cross`/`touch`/`overlap`)다.
 *
 * - transversal edge crossing은 `kind: 'cross'`다.
 * - polygon vertex를 지나는 hit은 인접 edge 중복 없이 `kind: 'touch'` 하나로 dedupe된다.
 * - polygon edge와 collinear overlap이면 overlap 구간 양 끝점을 `kind: 'overlap'`으로 반환한다.
 * - segment가 polygon 내부에 완전히 포함되면(edge 교점 없음) 빈 배열이다. boolean relation과 다르다.
 * - empty polygon(`points.length < 3`)과 degenerate segment direction(zero-length)은 빈 배열이다.
 *
 * 결과 hit은 segment parameter `tLine` 오름차순이다. 반환 hit과 nested point는 매 호출 새 object이며
 * 입력 point object를 재사용하지 않는다.
 * `epsilon`은 collinear/vertex dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param segment 교점을 구할 segment
 * @param polygon 교점을 구할 polygon
 * @param epsilon collinear/dedupe 판정 임계값
 */
export function segmentPolygonIntersections(
  segment: SegmentLike,
  polygon: PolygonLike,
  epsilon = DEFAULT_EPSILON
): LinePolygonIntersectionHit[] {
  const out: LinePolygonIntersectionHit[] = [];
  segmentPolygonIntersectionsInto(out, segment, polygon, epsilon);
  return out;
}
