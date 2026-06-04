import { DEFAULT_EPSILON } from '../internal/numeric';
import type { SegmentLike, XYObjectWritable } from '../types';
import { segmentSegmentIntersectionsInto } from './segment-segment-intersections-into';

/**
 * 두 segment의 교점을 새 배열로 반환한다.
 *
 * `segmentSegmentIntersectionsInto`의 allocating companion이다. point/overlap만 점으로 노출한다.
 * - proper crossing, T-crossing, shared endpoint, zero-length point hit, collinear endpoint touch는
 *   한 점을 반환한다.
 * - 길이를 가진 collinear overlap은 `start`, `end` 두 점을 segment `a` parameter `tA` 오름차순으로
 *   반환한다.
 * - disjoint, parallel disjoint, collinear non-overlap, non-finite는 빈 배열을 반환한다.
 *
 * 반환 point는 매 호출 새 `{ x, y }` object이며 입력 point object를 재사용하지 않는다.
 * `epsilon`은 평행 판정 및 거리 임계값이며 finite validation에는 쓰지 않는다.
 *
 * @param a 첫 번째 segment. point ordering의 기준이다.
 * @param b 두 번째 segment
 * @param epsilon 평행 판정 및 거리 임계값
 */
export function segmentSegmentIntersections(
  a: SegmentLike,
  b: SegmentLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const out: XYObjectWritable[] = [];
  segmentSegmentIntersectionsInto(out, a, b, epsilon);
  return out;
}
