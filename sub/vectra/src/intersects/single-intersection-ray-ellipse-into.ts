import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { lineFamilyEllipseIntersectionPoint } from '../internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readX, readY } from '../internal/xy';
import type { EllipseLike, RayLike, XYWritable } from '../types';

/**
 * ray와 ellipse의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * tangent이면 접점을 기록한다. 2-point crossing이면 false (out 미수정).
 * ray origin이 내부일 때 t ≥ 0인 exit 교점이 1개이면 true + 기록.
 * empty ellipse (radiusX ≤ 0 또는 radiusY ≤ 0): false. aliasing 불가.
 *
 * @param out 교점 좌표를 기록할 writable output
 * @param ray origin에서 direction 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param ellipse 교점을 구할 ellipse
 * @param epsilon 수치 비교 tolerance
 */
export function singleIntersectionRayEllipseInto(
  out: XYWritable,
  ray: RayLike,
  ellipse: EllipseLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const origin = readRayOrigin(ray);
  const direction = readRayDirection(ray);
  const center = readEllipseCenter(ellipse);
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
  );
}
