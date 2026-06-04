import { DEFAULT_EPSILON } from '../internal/numeric';
import type { BoundsLike, CircleLike, XYObjectWritable } from '../types';
import { circleBoundsIntersectionsInto } from './circle-bounds-intersections-into';

/**
 * circle circumference와 bounds boundary의 교점을 새 배열로 반환한다.
 *
 * `circleBoundsIntersectionsInto`의 allocating companion이다. boundary 4개 edge와 circle의 교점을 모으고
 * corner/tangent 중복을 dedupe하며, circle center 기준 normalized turn 오름차순으로 반환한다. boundary
 * 교점이 없는 containment-only, empty circle, empty bounds는 빈 배열을 반환한다.
 *
 * 반환 point는 매 호출 새 `{ x, y }` object이며 입력 center object를 재사용하지 않는다.
 * `epsilon`은 tangent/dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param circle 교점을 구할 circle. point ordering의 기준이다.
 * @param bounds 교점을 구할 bounds (axis-aligned)
 * @param epsilon tangent/dedupe 판정 임계값
 */
export function circleBoundsIntersections(
  circle: CircleLike,
  bounds: BoundsLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const out: XYObjectWritable[] = [];
  circleBoundsIntersectionsInto(out, circle, bounds, epsilon);
  return out;
}
