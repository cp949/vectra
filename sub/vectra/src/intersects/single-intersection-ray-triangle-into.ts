import { lineFamilyTriangleIntersectionPoint, rayToLineFamilyParam } from '../internal/line-family';
import type { Ray, Triangle, PointWritable } from '../types/flat-shapes.internal';

/**
 * ray와 triangle의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * 교점이 2개 이상이거나 collinear이면 false를 반환하고 out을 수정하지 않는다.
 * degenerate triangle (꼭짓점이 collinear이거나 coincident): false. aliasing 불가.
 *
 * @param out 교점 좌표를 기록할 writable output
 * @param ray (ox, oy)에서 (dx, dy) 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param triangle 교점을 구할 triangle
 * @param epsilon 수치 비교 tolerance
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function singleIntersectionRayTriangleInto(
  out: PointWritable,
  ray: Ray,
  triangle: Triangle,
  epsilon?: number
): boolean {
  const lineParam = rayToLineFamilyParam(ray.ox, ray.oy, ray.dx, ray.dy);
  const { x1: ax, y1: ay, x2: bx, y2: by, x3: cx, y3: cy } = triangle;
  return lineFamilyTriangleIntersectionPoint(out, lineParam, ax, ay, bx, by, cx, cy, epsilon);
}
