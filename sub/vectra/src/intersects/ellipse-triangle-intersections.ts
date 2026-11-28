import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Ellipse, Triangle, PointWritable } from '../types/flat-shapes.internal';
import { ellipseTriangleIntersectionsInto } from './ellipse-triangle-intersections-into';

/**
 * ellipse circumference와 triangle boundary의 교점을 새 배열로 반환한다.
 *
 * `ellipseTriangleIntersectionsInto`의 allocating companion이다. boundary 3개 edge와 ellipse의 교점을
 * 모으고 vertex/tangent 중복을 dedupe하며, ellipse center 기준 normalized turn 오름차순으로 반환한다.
 * boundary 교점이 없는 containment-only, empty ellipse(radiusX/radiusY ≤ 0), degenerate triangle(signed
 * area 2× === 0), non-finite vertex는 빈 배열을 반환한다. axis-aligned ellipse만 지원한다(rotated ellipse 비범위).
 *
 * 반환 point는 매 호출 새 `{ x, y }` object다.
 * `epsilon`은 tangent/dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param ellipse 교점을 구할 ellipse (axis-aligned). point ordering의 기준이다.
 * @param triangle 교점을 구할 triangle
 * @param epsilon tangent/dedupe 판정 임계값
 */
export function ellipseTriangleIntersections(
  ellipse: Ellipse,
  triangle: Triangle,
  epsilon = DEFAULT_EPSILON
): PointWritable[] {
  const out: PointWritable[] = [];
  ellipseTriangleIntersectionsInto(out, ellipse, triangle, epsilon);
  return out;
}
