import { lineFamilyEllipseIntersectionPoint } from '../internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Ellipse, Ray, PointWritable } from '../types/flat-shapes.internal';

/**
 * ray와 ellipse의 단일 교점을 새 object로 반환한다.
 *
 * tangent이면 접점 object를 반환한다. 교점이 없거나 2개 이상이면 undefined를 반환한다.
 * ray 시작점 (ox, oy)가 내부일 때 t ≥ 0인 exit 교점이 1개이면 해당 point object를 반환한다.
 * empty ellipse (rx ≤ 0 또는 ry ≤ 0): undefined.
 * allocating companion — internal helper를 직접 호출한다.
 *
 * @param ray (ox, oy)에서 (dx, dy) 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param ellipse 교점을 구할 ellipse
 * @param epsilon 수치 비교 tolerance
 */
export function singleIntersectionRayEllipse(
  ray: Ray,
  ellipse: Ellipse,
  epsilon = DEFAULT_EPSILON
): PointWritable | undefined {
  const out: PointWritable = { x: 0, y: 0 };
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
  )
    ? out
    : undefined;
}
