import { DEFAULT_EPSILON } from '../internal/numeric';
import type { CircleLike, InfiniteLineLike, XYObjectWritable } from '../types';
import { infiniteLineCircleIntersectionsInto } from './infinite-line-circle-intersections-into';

/**
 * infinite-line과 circle circumference의 모든 교점을 새 배열로 반환한다.
 *
 * `infiniteLineCircleIntersectionsInto`의 allocating companion이다.
 * - tangent는 중복 없이 한 점, proper two-point는 두 점을 line parameter `t` 오름차순으로 반환한다.
 * - no hit, degenerate direction(zero-length), empty circle(radius ≤ 0)은 빈 배열을 반환한다.
 *
 * 반환 point는 매 호출 새 `{ x, y }` object이며 입력 point object를 재사용하지 않는다.
 * `epsilon`은 discriminant tangent 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param line 교점을 구할 infinite-line (전체 finite t 범위)
 * @param circle 교점을 구할 circle
 * @param epsilon discriminant tangent 판정 임계값
 */
export function infiniteLineCircleIntersections(
  line: InfiniteLineLike,
  circle: CircleLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const out: XYObjectWritable[] = [];
  infiniteLineCircleIntersectionsInto(out, line, circle, epsilon);
  return out;
}
