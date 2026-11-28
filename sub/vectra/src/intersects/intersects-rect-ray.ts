import { lineFamilyBoxIntersects, rayToLineFamilyParam } from '../internal/line-family';
import type { Ray, Rect } from '../types/flat-shapes.internal';

/**
 * rect와 ray가 교차하거나 접하면 true를 반환한다.
 *
 * rect 4변과의 line-family intersection으로 판정한다.
 * empty rect (width ≤ 0 또는 height ≤ 0): false.
 *
 * @param rect 교차를 검사할 rect
 * @param ray 교차를 검사할 ray
 * @param epsilon 수치 비교 tolerance
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function intersectsRectRay(rect: Rect, ray: Ray, epsilon?: number): boolean {
  const rw = rect.width;
  const rh = rect.height;
  if (rw <= 0 || rh <= 0) return false;
  const lineParam = rayToLineFamilyParam(ray.ox, ray.oy, ray.dx, ray.dy);
  const rx = rect.x;
  const ry = rect.y;
  return lineFamilyBoxIntersects(lineParam, rx, ry, rx + rw, ry + rh, epsilon);
}
