import { lineFamilyBoxIntersectionPoint, rayToLineFamilyParam } from '../internal/line-family';
import type { Ray, Rect, PointWritable } from '../types/flat-shapes.internal';

/**
 * ray와 rect의 단일 교점을 새 object로 반환한다.
 *
 * 교점이 없거나 2개 이상이면 undefined를 반환한다.
 * empty rect (width ≤ 0 또는 height ≤ 0): undefined.
 * allocating companion — internal helper를 직접 호출한다.
 *
 * @param ray (ox, oy)에서 (dx, dy) 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param rect 교점을 구할 rect
 * @param epsilon 수치 비교 tolerance
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function singleIntersectionRayRect(ray: Ray, rect: Rect, epsilon?: number): PointWritable | undefined {
  const rw = rect.width;
  const rh = rect.height;
  if (rw <= 0 || rh <= 0) return undefined;
  const lineParam = rayToLineFamilyParam(ray.ox, ray.oy, ray.dx, ray.dy);
  const rx = rect.x;
  const ry = rect.y;
  const out: PointWritable = { x: 0, y: 0 };
  return lineFamilyBoxIntersectionPoint(out, lineParam, rx, ry, rx + rw, ry + rh, epsilon) ? out : undefined;
}
