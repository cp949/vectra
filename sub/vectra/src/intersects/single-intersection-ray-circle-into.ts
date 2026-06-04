import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { lineFamilyCircleIntersectionPoint, rayToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readX, readY } from '../internal/xy';
import type { CircleLike, RayLike, XYWritable } from '../types';

/**
 * ray와 circle의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * tangent이면 접점을 기록한다. 2-point crossing이면 false (out 미수정).
 * ray origin이 circle 내부이면 exit point를 기록하고 true를 반환한다.
 * empty circle (radius ≤ 0): false. aliasing 불가.
 *
 * @param out 교점 좌표를 기록할 writable output
 * @param ray origin에서 direction 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param circle 교점을 구할 circle
 * @param epsilon 수치 비교 tolerance
 */
export function singleIntersectionRayCircleInto(
  out: XYWritable,
  ray: RayLike,
  circle: CircleLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const origin = readRayOrigin(ray);
  const dir = readRayDirection(ray);
  const lineParam = rayToLineFamilyParam(readX(origin), readY(origin), readX(dir), readY(dir));
  const center = readCircleCenter(circle);
  return lineFamilyCircleIntersectionPoint(
    out,
    lineParam,
    readX(center),
    readY(center),
    readCircleRadius(circle),
    epsilon
  );
}
