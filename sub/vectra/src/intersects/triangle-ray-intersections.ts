import { DEFAULT_EPSILON } from '../internal/numeric';
import type { RayLike, TriangleLike, XYObjectWritable } from '../types';
import { triangleRayIntersectionsInto } from './triangle-ray-intersections-into';

/**
 * triangle과 ray boundary의 range 안 모든 교점을 새 배열로 반환한다.
 *
 * `triangleRayIntersectionsInto`의 allocating companion이다. boundary 교점만 노출한다.
 * - transversal crossing, vertex touch 1점(dedupe), edge collinear overlap은 clipped start/end 2점이다.
 * - ray origin이 triangle 내부면 t ≥ 0 exit 교점만 반환한다. boundary 교점이 없으면 빈 배열이다.
 * - degenerate triangle(signed area 2× === 0), non-finite vertex, zero-vector direction, non-finite
 *   coordinate는 빈 배열이다. degenerate triangle을 segment/point relation으로 환원하지 않는다.
 *
 * 반환 point는 매 호출 새 `{ x, y }` object이며 입력 point object를 재사용하지 않는다. 반환 순서는
 * ray parameter `t` 오름차순이다. `epsilon`은 collinear/dedupe 판정에만 쓰고 range 판정은 ray
 * parameter의 정확 비교를 따른다. finite validation에는 쓰지 않는다.
 *
 * @param triangle 교점을 구할 triangle. point ordering의 기준은 ray parameter다.
 * @param ray origin에서 direction 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param epsilon collinear/dedupe 판정 임계값
 */
export function triangleRayIntersections(
  triangle: TriangleLike,
  ray: RayLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const out: XYObjectWritable[] = [];
  triangleRayIntersectionsInto(out, triangle, ray, epsilon);
  return out;
}
