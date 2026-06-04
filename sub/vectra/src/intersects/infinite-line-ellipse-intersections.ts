import { DEFAULT_EPSILON } from '../internal/numeric';
import type { EllipseLike, InfiniteLineLike, XYObjectWritable } from '../types';
import { infiniteLineEllipseIntersectionsInto } from './infinite-line-ellipse-intersections-into';

/**
 * infinite-line과 ellipse circumference의 모든 교점을 새 배열로 반환한다.
 *
 * `infiniteLineEllipseIntersectionsInto`의 allocating companion이다.
 * - tangent는 중복 없이 한 점, proper two-point는 두 점을 line parameter `t` 오름차순으로 반환한다.
 * - no hit, degenerate direction(zero-length), empty ellipse(radiusX ≤ 0 또는 radiusY ≤ 0)는
 *   빈 배열을 반환한다.
 *
 * 반환 point는 매 호출 새 `{ x, y }` object이며 입력 point object를 재사용하지 않는다.
 * `epsilon`은 discriminant tangent 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param line 교점을 구할 infinite-line (전체 finite t 범위)
 * @param ellipse 교점을 구할 ellipse
 * @param epsilon discriminant tangent 판정 임계값
 */
export function infiniteLineEllipseIntersections(
  line: InfiniteLineLike,
  ellipse: EllipseLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const out: XYObjectWritable[] = [];
  infiniteLineEllipseIntersectionsInto(out, line, ellipse, epsilon);
  return out;
}
