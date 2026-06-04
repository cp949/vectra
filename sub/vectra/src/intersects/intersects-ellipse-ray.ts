import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { lineFamilyEllipseIntersects } from '../internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readX, readY } from '../internal/xy';
import type { EllipseLike, RayLike } from '../types';

/**
 * ellipse와 ray가 교차하거나 접하면 true를 반환한다.
 *
 * closed disk 판정. tangent, 2-point crossing, ray origin 내부 포함 모두 true.
 * degenerate ellipse (rx ≤ 0 또는 ry ≤ 0): false.
 * degenerate ray (direction = 0): origin이 ellipse 경계/내부이면 true.
 *
 * @param ellipse 교차를 검사할 ellipse
 * @param ray 교차를 검사할 ray
 * @param epsilon 수치 비교 tolerance
 */
export function intersectsEllipseRay(ellipse: EllipseLike, ray: RayLike, epsilon = DEFAULT_EPSILON): boolean {
  const origin = readRayOrigin(ray);
  const direction = readRayDirection(ray);
  const center = readEllipseCenter(ellipse);
  return lineFamilyEllipseIntersects(
    readX(origin),
    readY(origin),
    readX(direction),
    readY(direction),
    'ray',
    readX(center),
    readY(center),
    readEllipseRadiusX(ellipse),
    readEllipseRadiusY(ellipse),
    epsilon
  );
}
