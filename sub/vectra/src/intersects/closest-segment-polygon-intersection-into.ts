import { closestLineFamilyPolygonIntersectionInto } from '../internal/polygon-line-intersections';
import type { LinePolygonIntersectionHit } from '../types';
import type { PointWritable, Polygon, Segment } from '../types/flat-shapes.internal';

/**
 * segment와 polygon edge의 가장 가까운 교점을 out에 기록하고 true를 반환한다.
 *
 * `segmentPolygonIntersections` collection의 첫 hit(segment parameter `tLine` 최소)을 source of
 * truth로 사용한다. 별도 교점 계산으로 drift를 만들지 않는다.
 * out에는 `point`=교점, `kind`=edge-level 교차 종류(`cross`/`touch`/`overlap`),
 * `tLine`=segment parameter `[0, 1]`, `tEdge`=edge-local parameter `[0, 1]`, `edgeIndex`=polygon edge
 * index를 기록한다. overlap이 첫 hit이면 overlap 구간 시작점(`kind: 'overlap'`)을 기록한다.
 *
 * - 교점이 없으면(containment-only segment 포함) `false`를 반환하고 out을 수정하지 않는다.
 * - empty polygon(`좌표 수 < 6`)과 degenerate segment direction(zero-length)도 `false`다.
 *
 * out.point는 매 호출 새로 기록하므로 좌표를 받을 writable storage여야 한다.
 * `epsilon`은 collinear/vertex dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param out 교점을 기록할 hit. point는 { x, y }이며 교점이 없으면 그대로 둔다.
 * @param segment 교점을 구할 segment
 * @param polygon 교점을 구할 polygon
 * @param epsilon collinear/dedupe 판정 임계값
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function closestSegmentPolygonIntersectionInto(
  out: LinePolygonIntersectionHit,
  segment: Segment,
  polygon: Polygon,
  epsilon?: number
): boolean {
  const ax = segment.x1;
  const ay = segment.y1;
  return closestLineFamilyPolygonIntersectionInto(
    out,
    ax,
    ay,
    segment.x2 - ax,
    segment.y2 - ay,
    'finite',
    polygon,
    epsilon
  );
}
