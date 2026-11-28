import { lineFamilyBoxIntersectionPoint, rayToLineFamilyParam } from '../internal/line-family';
import type { Ray, Rect, PointWritable } from '../types/flat-shapes.internal';

/**
 * ray와 rect의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * 교점이 2개 이상이거나 collinear이면 false를 반환하고 out을 수정하지 않는다.
 * empty rect (width ≤ 0 또는 height ≤ 0): false. aliasing 불가.
 *
 * @param out 교점 좌표를 기록할 변경 가능한 점 `{ x, y }`
 * @param ray (ox, oy)에서 (dx, dy) 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param rect 교점을 구할 rect
 * @param epsilon 수치 비교 tolerance
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function singleIntersectionRayRectInto(out: PointWritable, ray: Ray, rect: Rect, epsilon?: number): boolean {
  const rw = rect.width;
  const rh = rect.height;
  if (rw <= 0 || rh <= 0) return false;
  const lineParam = rayToLineFamilyParam(ray.ox, ray.oy, ray.dx, ray.dy);
  const rx = rect.x;
  const ry = rect.y;
  return lineFamilyBoxIntersectionPoint(out, lineParam, rx, ry, rx + rw, ry + rh, epsilon);
}
