import { lineFamilyCircleIntersects, rayToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Circle, Ray } from '../types/flat-shapes.internal';

/**
 * circle과 ray가 교차하거나 접하면 true를 반환한다.
 *
 * closed disk 판정. ray origin이 disk 내부이면 true.
 * radius ≤ 0인 circle: false.
 *
 * @param circle 교차를 판정할 circle
 * @param ray 교차를 판정할 ray
 * @param epsilon 부동소수점 비교에 사용할 tolerance
 */
export function intersectsCircleRay(circle: Circle, ray: Ray, epsilon = DEFAULT_EPSILON): boolean {
  const lineParam = rayToLineFamilyParam(ray.ox, ray.oy, ray.dx, ray.dy);
  return lineFamilyCircleIntersects(lineParam, circle.cx, circle.cy, circle.r, epsilon);
}
