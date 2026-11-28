import { lineFamilyBoxIntersects, rayToLineFamilyParam } from '../internal/line-family';
import type { Bounds, Ray } from '../types/flat-shapes.internal';

/**
 * bounds와 ray가 교차하거나 접하면 true를 반환한다.
 *
 * bounds 4변을 segment로 보고 각 변과의 line-family intersection을 판정한다.
 * inverted bounds (min > max): false.
 * closed boundary 포함 (접점도 true).
 *
 * @param bounds 교차를 판정할 bounds
 * @param ray 교차를 판정할 ray
 * @param epsilon 부동소수점 비교에 사용할 tolerance
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function intersectsBoundsRay(bounds: Bounds, ray: Ray, epsilon?: number): boolean {
  const x0 = bounds.minX;
  const y0 = bounds.minY;
  const x1 = bounds.maxX;
  const y1 = bounds.maxY;
  if (x1 < x0 || y1 < y0) return false;
  const lineParam = rayToLineFamilyParam(ray.ox, ray.oy, ray.dx, ray.dy);
  return lineFamilyBoxIntersects(lineParam, x0, y0, x1, y1, epsilon);
}
