import { DEFAULT_EPSILON } from '../internal/numeric';
import type { CircleLike, TriangleLike, XYObjectWritable } from '../types';
import { circleTriangleIntersectionsInto } from './circle-triangle-intersections-into';

/**
 * circle circumference와 triangle boundary의 교점을 새 배열로 반환한다.
 *
 * `circleTriangleIntersectionsInto`의 allocating companion이다. boundary 3개 edge와 circle의 교점을
 * 모으고 vertex/tangent 중복을 dedupe하며, circle center 기준 normalized turn 오름차순으로 반환한다.
 * boundary 교점이 없는 containment-only, empty circle(radius ≤ 0), degenerate triangle(signed area
 * 2× === 0), non-finite vertex는 빈 배열을 반환한다.
 *
 * 반환 point는 매 호출 새 `{ x, y }` object이며 입력 center/vertex object를 재사용하지 않는다.
 * `epsilon`은 tangent/dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param circle 교점을 구할 circle. point ordering의 기준이다.
 * @param triangle 교점을 구할 triangle
 * @param epsilon tangent/dedupe 판정 임계값
 */
export function circleTriangleIntersections(
  circle: CircleLike,
  triangle: TriangleLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const out: XYObjectWritable[] = [];
  circleTriangleIntersectionsInto(out, circle, triangle, epsilon);
  return out;
}
