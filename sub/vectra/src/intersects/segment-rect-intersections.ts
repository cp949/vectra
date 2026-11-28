import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Rect, Segment, PointWritable } from '../types/flat-shapes.internal';
import { segmentRectIntersectionsInto } from './segment-rect-intersections-into';

/**
 * segment와 rect boundary의 교점을 새 배열로 반환한다.
 *
 * `segmentRectIntersectionsInto`의 allocating companion이다. boundary 4개 edge와의 교점을 모으고
 * corner/edge 중복을 dedupe하며, segment parameter `t` 오름차순으로 반환한다. boundary 교점이
 * 없는 containment-only, empty box, zero-length segment는 빈 배열을 반환한다.
 *
 * 반환 point는 매 호출 새 `{ x, y }` object이며 입력 point object를 재사용하지 않는다.
 * `epsilon`은 collinear/dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param segment 교점을 구할 segment
 * @param rect 교점을 구할 rect (axis-aligned)
 * @param epsilon collinear/dedupe 판정 임계값
 */
export function segmentRectIntersections(segment: Segment, rect: Rect, epsilon = DEFAULT_EPSILON): PointWritable[] {
  const out: PointWritable[] = [];
  segmentRectIntersectionsInto(out, segment, rect, epsilon);
  return out;
}
