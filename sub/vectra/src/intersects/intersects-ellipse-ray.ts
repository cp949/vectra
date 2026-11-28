import { lineFamilyEllipseIntersects } from '../internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Ellipse, Ray } from '../types/flat-shapes.internal';

/**
 * ellipse와 ray가 교차하거나 접하면 true를 반환한다.
 *
 * closed disk 판정. tangent, 2-point crossing, ray 시작점 (ox, oy) 내부 포함 모두 true.
 * degenerate ellipse (rx ≤ 0 또는 ry ≤ 0): false.
 * degenerate ray(`dx = dy = 0`): 시작점 (ox, oy)가 ellipse 경계/내부이면 true.
 *
 * @param ellipse 교차를 검사할 ellipse
 * @param ray 교차를 검사할 ray
 * @param epsilon 수치 비교 tolerance
 */
export function intersectsEllipseRay(ellipse: Ellipse, ray: Ray, epsilon = DEFAULT_EPSILON): boolean {
  return lineFamilyEllipseIntersects(
    ray.ox,
    ray.oy,
    ray.dx,
    ray.dy,
    'ray',
    ellipse.cx,
    ellipse.cy,
    ellipse.rx,
    ellipse.ry,
    epsilon
  );
}
