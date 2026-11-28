import { lineFamilyCircleIntersectionPoint, rayToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Circle, Ray, PointWritable } from '../types/flat-shapes.internal';

/**
 * ray와 circle의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * tangent이면 접점을 기록한다. 2-point crossing이면 false (out 미수정).
 * ray origin이 circle 내부이면 exit point를 기록하고 true를 반환한다.
 * empty circle (radius ≤ 0): false. aliasing 불가.
 *
 * @param out 교점 좌표를 기록할 { x, y } 객체. 실패 시 수정하지 않는다.
 * @param ray origin에서 direction 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param circle 교점을 구할 circle
 * @param epsilon 수치 비교 tolerance
 */
export function singleIntersectionRayCircleInto(
  out: PointWritable,
  ray: Ray,
  circle: Circle,
  epsilon = DEFAULT_EPSILON
): boolean {
  const lineParam = rayToLineFamilyParam(ray.ox, ray.oy, ray.dx, ray.dy);
  return lineFamilyCircleIntersectionPoint(out, lineParam, circle.cx, circle.cy, circle.r, epsilon);
}
