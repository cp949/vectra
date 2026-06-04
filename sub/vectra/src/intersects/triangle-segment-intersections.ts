import { DEFAULT_EPSILON } from '../internal/numeric';
import type { SegmentLike, TriangleLike, XYObjectWritable } from '../types';
import { triangleSegmentIntersectionsInto } from './triangle-segment-intersections-into';

/**
 * triangle과 segment boundary의 range 안 모든 교점을 새 배열로 반환한다.
 *
 * `triangleSegmentIntersectionsInto`의 allocating companion이다. boundary 교점만 노출한다.
 * - transversal crossing, vertex touch 1점(dedupe), edge collinear overlap은 clipped start/end 2점이다.
 * - segment가 triangle 내부에 완전히 포함되어 boundary 교점이 없으면 빈 배열이다.
 * - degenerate triangle(signed area 2× === 0), non-finite vertex, zero-length segment, non-finite
 *   coordinate는 빈 배열이다. degenerate triangle을 segment/point relation으로 환원하지 않는다.
 *
 * 반환 point는 매 호출 새 `{ x, y }` object이며 입력 point object를 재사용하지 않는다. 반환 순서는
 * segment parameter `t` 오름차순이다. `epsilon`은 collinear/dedupe 판정에만 쓰고 range 판정은
 * segment parameter의 정확 비교를 따른다. finite validation에는 쓰지 않는다.
 *
 * @param triangle 교점을 구할 triangle. point ordering의 기준은 segment parameter다.
 * @param segment 교점을 구할 segment
 * @param epsilon collinear/dedupe 판정 임계값
 */
export function triangleSegmentIntersections(
  triangle: TriangleLike,
  segment: SegmentLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const out: XYObjectWritable[] = [];
  triangleSegmentIntersectionsInto(out, triangle, segment, epsilon);
  return out;
}
