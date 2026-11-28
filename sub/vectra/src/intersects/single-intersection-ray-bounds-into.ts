import { lineFamilyBoxIntersectionPoint, rayToLineFamilyParam } from '../internal/line-family';
import type { Bounds, Ray, PointWritable } from '../types/flat-shapes.internal';

/**
 * ray와 bounds의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * 교점이 2개 이상이거나 collinear이면 false를 반환하고 out을 수정하지 않는다.
 * inverted bounds (max < min): false. aliasing 불가.
 *
 * @param out 교점 좌표를 기록할 변경 가능한 점 `{ x, y }`
 * @param ray (ox, oy)에서 (dx, dy) 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param bounds 교점을 구할 axis-aligned bounding box
 * @param epsilon 수치 비교 tolerance
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function singleIntersectionRayBoundsInto(
  out: PointWritable,
  ray: Ray,
  bounds: Bounds,
  epsilon?: number
): boolean {
  const x0 = bounds.minX;
  const y0 = bounds.minY;
  const x1 = bounds.maxX;
  const y1 = bounds.maxY;
  if (x1 < x0 || y1 < y0) return false;
  const lineParam = rayToLineFamilyParam(ray.ox, ray.oy, ray.dx, ray.dy);
  return lineFamilyBoxIntersectionPoint(out, lineParam, x0, y0, x1, y1, epsilon);
}
