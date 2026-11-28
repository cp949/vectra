import { rayToLineFamilyParam } from '../internal/line-family';
import { lineFamilyPolylineIntersects } from '../internal/polyline-relation';
import type { Polyline, Ray } from '../types/flat-shapes.internal';

/**
 * ray와 polyline이 교차하면 true를 반환한다.
 *
 * polyline은 open path로 마지막 point에서 첫 point로 닫지 않는다.
 * segment가 없는 polyline(points.length < 2)은 false를 반환한다.
 *
 * @param ray      교차를 검사할 ray
 * @param polyline 교차를 검사할 polyline
 * @param epsilon  교차 판정 허용 오차
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function intersectsPolylineRay(polyline: Polyline, ray: Ray, epsilon?: number): boolean {
  const lineParam = rayToLineFamilyParam(ray.ox, ray.oy, ray.dx, ray.dy);
  return lineFamilyPolylineIntersects(lineParam, polyline, epsilon);
}
