import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { lineFamilyEllipseIntersectionPoint } from '../internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readX, readY } from '../internal/xy';
import type { EllipseLike, RayLike, XYObjectWritable } from '../types';

/**
 * ray와 ellipse의 단일 교점을 새 object로 반환한다.
 *
 * tangent이면 접점 object를 반환한다. 교점이 없거나 2개 이상이면 undefined를 반환한다.
 * ray origin이 내부일 때 t ≥ 0인 exit 교점이 1개이면 해당 point object를 반환한다.
 * empty ellipse (radiusX ≤ 0 또는 radiusY ≤ 0): undefined.
 * allocating companion — internal helper를 직접 호출한다.
 *
 * @param ray origin에서 direction 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param ellipse 교점을 구할 ellipse
 * @param epsilon 수치 비교 tolerance
 */
export function singleIntersectionRayEllipse(
  ray: RayLike,
  ellipse: EllipseLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable | undefined {
  const origin = readRayOrigin(ray);
  const direction = readRayDirection(ray);
  const center = readEllipseCenter(ellipse);
  const out: XYObjectWritable = { x: 0, y: 0 };
  return lineFamilyEllipseIntersectionPoint(
    out,
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
  )
    ? out
    : undefined;
}
