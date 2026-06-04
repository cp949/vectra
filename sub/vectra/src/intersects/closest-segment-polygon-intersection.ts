import { DEFAULT_EPSILON } from '../internal/numeric';
import type { LinePolygonIntersectionHit, PolygonLike, SegmentLike, XYObjectWritable } from '../types';
import { closestSegmentPolygonIntersectionInto } from './closest-segment-polygon-intersection-into';

/**
 * segment와 polygon edge의 가장 가까운 교점을 새 hit으로 반환한다.
 *
 * `closestSegmentPolygonIntersectionInto`의 allocating companion이다.
 * `segmentPolygonIntersections` collection의 첫 hit(segment parameter `tLine` 최소)과 같은
 * point/metadata를 반환한다. overlap이 첫 hit이면 overlap 구간 시작점(`kind: 'overlap'`)을 반환한다.
 *
 * - 교점이 없으면(containment-only segment 포함) `undefined`를 반환한다.
 * - empty polygon(`points.length < 3`)과 degenerate segment direction(zero-length)도 `undefined`다.
 *
 * 반환 hit과 nested point는 매 호출 새 object이며 입력 point object를 재사용하지 않는다.
 * `epsilon`은 collinear/vertex dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param segment 교점을 구할 segment
 * @param polygon 교점을 구할 polygon
 * @param epsilon collinear/dedupe 판정 임계값
 */
export function closestSegmentPolygonIntersection(
  segment: SegmentLike,
  polygon: PolygonLike,
  epsilon = DEFAULT_EPSILON
): LinePolygonIntersectionHit<XYObjectWritable> | undefined {
  const out: LinePolygonIntersectionHit<XYObjectWritable> = {
    point: { x: 0, y: 0 },
    kind: 'cross',
    tLine: 0,
    tEdge: 0,
    edgeIndex: 0,
  };
  return closestSegmentPolygonIntersectionInto(out, segment, polygon, epsilon) ? out : undefined;
}
