import { DEFAULT_EPSILON } from '../internal/numeric';
import type { BoundsLike, RayLike, XYObjectWritable } from '../types';
import { rayBoundsIntersectionsInto } from './ray-bounds-intersections-into';

/**
 * ray와 bounds boundary의 교점을 새 배열로 반환한다.
 *
 * `rayBoundsIntersectionsInto`의 allocating companion이다. boundary 4개 edge와의 교점을 모으고
 * corner/edge 중복을 dedupe하며, ray parameter `t` 오름차순으로 반환한다. boundary 교점이
 * 없는 containment-only, empty box, degenerate direction은 빈 배열을 반환한다.
 *
 * 반환 point는 매 호출 새 `{ x, y }` object이며 입력 point object를 재사용하지 않는다.
 * `epsilon`은 collinear/dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param ray 교점을 구할 ray
 * @param bounds 교점을 구할 bounds (axis-aligned)
 * @param epsilon collinear/dedupe 판정 임계값
 */
export function rayBoundsIntersections(
  ray: RayLike,
  bounds: BoundsLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const out: XYObjectWritable[] = [];
  rayBoundsIntersectionsInto(out, ray, bounds, epsilon);
  return out;
}
