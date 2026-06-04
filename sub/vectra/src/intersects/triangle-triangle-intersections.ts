import { DEFAULT_EPSILON } from '../internal/numeric';
import type { TriangleLike, XYObjectWritable } from '../types';
import { triangleTriangleIntersectionsInto } from './triangle-triangle-intersections-into';

/**
 * 두 triangle boundary의 교점을 새 배열로 반환한다.
 *
 * `triangleTriangleIntersectionsInto`의 allocating companion이다. boundary 교점만 노출한다.
 * - transversal edge crossing은 1점, shared vertex/edge endpoint 중복은 dedupe된 1점이다.
 * - shared edge collinear overlap은 start/end 두 점을 노출한다.
 * - 한 triangle이 다른 triangle을 완전히 포함하는 containment-only, degenerate triangle(signed area
 *   2× === 0), non-finite vertex는 빈 배열을 반환한다.
 *
 * 반환 point는 매 호출 새 `{ x, y }` object이며 입력 vertex object를 재사용하지 않는다. 반환 순서는
 * triangle `a` boundary traversal 순서다. `epsilon`은 평행/거리/dedupe 판정에만 쓰고 finite
 * validation에는 쓰지 않는다.
 *
 * @param a 첫 번째 triangle. point ordering의 기준이다.
 * @param b 두 번째 triangle
 * @param epsilon 평행/거리/dedupe 판정 임계값
 */
export function triangleTriangleIntersections(
  a: TriangleLike,
  b: TriangleLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const out: XYObjectWritable[] = [];
  triangleTriangleIntersectionsInto(out, a, b, epsilon);
  return out;
}
