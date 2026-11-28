import { lineFamilyEllipseIntersectionPoint } from '../internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Ellipse, Ray, PointWritable } from '../types/flat-shapes.internal';

/**
 * ray와 ellipse의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * tangent이면 접점을 기록한다. 2-point crossing이면 false (out 미수정).
 * ray 시작점 (ox, oy)가 내부일 때 t ≥ 0인 exit 교점이 1개이면 true + 기록.
 * empty ellipse (rx ≤ 0 또는 ry ≤ 0): false. aliasing 불가.
 *
 * @param out 교점 좌표를 기록할 { x, y } 객체. 실패 시 수정하지 않는다.
 * @param ray (ox, oy)에서 (dx, dy) 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param ellipse 교점을 구할 ellipse
 * @param epsilon 수치 비교 tolerance
 */
export function singleIntersectionRayEllipseInto(
  out: PointWritable,
  ray: Ray,
  ellipse: Ellipse,
  epsilon = DEFAULT_EPSILON
): boolean {
  return lineFamilyEllipseIntersectionPoint(
    out,
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
