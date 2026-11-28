import { lineFamilyCircleIntersectionPoint, rayToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Circle, Ray, PointWritable } from '../types/flat-shapes.internal';

/**
 * ray와 circle의 단일 교점을 새 object로 반환한다.
 *
 * tangent이면 접점 object를 반환한다. 교점이 없거나 2개 이상이면 undefined를 반환한다.
 * ray origin이 circle 내부이면 exit point object를 반환한다.
 * empty circle (radius ≤ 0): undefined.
 * allocating companion — internal helper를 직접 호출한다.
 *
 * @param ray origin에서 direction 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param circle 교점을 구할 circle
 * @param epsilon 수치 비교 tolerance
 */
export function singleIntersectionRayCircle(
  ray: Ray,
  circle: Circle,
  epsilon = DEFAULT_EPSILON
): PointWritable | undefined {
  const lineParam = rayToLineFamilyParam(ray.ox, ray.oy, ray.dx, ray.dy);
  const out: PointWritable = { x: 0, y: 0 };
  return lineFamilyCircleIntersectionPoint(out, lineParam, circle.cx, circle.cy, circle.r, epsilon) ? out : undefined;
}
