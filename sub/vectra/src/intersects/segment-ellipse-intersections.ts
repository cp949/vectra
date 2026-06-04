import { DEFAULT_EPSILON } from '../internal/numeric';
import type { EllipseLike, SegmentLike, XYObjectWritable } from '../types';
import { segmentEllipseIntersectionsInto } from './segment-ellipse-intersections-into';

/**
 * segment와 ellipse circumference의 range 안 모든 교점을 새 배열로 반환한다.
 *
 * `segmentEllipseIntersectionsInto`의 allocating companion이다.
 * - tangent는 접점 t가 range(`t in [0, 1]`) 안일 때만 중복 없이 한 점이고, range 밖이면 빈 배열이다.
 * - proper two-point는 두 점을 segment parameter `t` 오름차순으로 반환한다.
 * - contained(segment 전체가 ellipse 내부, boundary root 없음), zero-length segment, empty ellipse
 *   (radiusX ≤ 0 또는 radiusY ≤ 0)는 빈 배열을 반환한다.
 *
 * 반환 point는 매 호출 새 `{ x, y }` object이며 입력 point object를 재사용하지 않는다.
 * `epsilon`은 discriminant tangent 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param segment 교점을 구할 segment
 * @param ellipse 교점을 구할 ellipse
 * @param epsilon discriminant tangent 판정 임계값
 */
export function segmentEllipseIntersections(
  segment: SegmentLike,
  ellipse: EllipseLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const out: XYObjectWritable[] = [];
  segmentEllipseIntersectionsInto(out, segment, ellipse, epsilon);
  return out;
}
