import { DEFAULT_EPSILON } from '../internal/numeric';
import type { InfiniteLineLike, TriangleLike, XYObjectWritable } from '../types';
import { triangleInfiniteLineIntersectionsInto } from './triangle-infinite-line-intersections-into';

/**
 * triangle과 infinite-line boundary의 모든 교점을 새 배열로 반환한다.
 *
 * `triangleInfiniteLineIntersectionsInto`의 allocating companion이다. boundary 교점만 노출한다.
 * - transversal crossing, vertex touch 1점(dedupe), edge collinear overlap은 clipped start/end 2점이다.
 * - line이 triangle을 가로지르면 양방향 2점이며 direction 부호와 무관하게 line parameter `t` 오름차순이다.
 * - degenerate triangle(signed area 2× === 0), non-finite vertex, zero-vector direction, non-finite
 *   coordinate는 빈 배열이다. degenerate triangle을 segment/point relation으로 환원하지 않는다.
 *
 * 반환 point는 매 호출 새 `{ x, y }` object이며 입력 point object를 재사용하지 않는다. 반환 순서는
 * line parameter `t` 오름차순이다. `epsilon`은 collinear/dedupe 판정에만 쓰고 range 판정은 line
 * parameter의 정확 비교를 따른다. finite validation에는 쓰지 않는다.
 *
 * @param triangle 교점을 구할 triangle. point ordering의 기준은 line parameter다.
 * @param infiniteLine origin을 지나 direction 양방향으로 무한히 뻗는 직선
 * @param epsilon collinear/dedupe 판정 임계값
 */
export function triangleInfiniteLineIntersections(
  triangle: TriangleLike,
  infiniteLine: InfiniteLineLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const out: XYObjectWritable[] = [];
  triangleInfiniteLineIntersectionsInto(out, triangle, infiniteLine, epsilon);
  return out;
}
