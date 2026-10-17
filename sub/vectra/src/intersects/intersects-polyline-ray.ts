import { rayToLineFamilyParam } from '../internal/line-family';
import { lineFamilyPolylineIntersects } from '../internal/polyline-relation';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readX, readY } from '../internal/xy';
import type { PolylineLike, RayLike } from '../types';

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
export function intersectsPolylineRay(polyline: PolylineLike, ray: RayLike, epsilon?: number): boolean {
  const o = readRayOrigin(ray);
  const d = readRayDirection(ray);
  const lineParam = rayToLineFamilyParam(readX(o), readY(o), readX(d), readY(d));
  return lineFamilyPolylineIntersects(lineParam, polyline, epsilon);
}
