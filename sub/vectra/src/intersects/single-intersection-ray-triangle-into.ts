import { lineFamilyTriangleIntersectionPoint, rayToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readTriangleRawCoords } from '../internal/triangle';
import { readX, readY } from '../internal/xy';
import type { RayLike, TriangleLike, XYWritable } from '../types';

/**
 * ray와 triangle의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * 교점이 2개 이상이거나 collinear이면 false를 반환하고 out을 수정하지 않는다.
 * degenerate triangle (꼭짓점이 collinear이거나 coincident): false. aliasing 불가.
 *
 * @param out 교점 좌표를 기록할 writable output
 * @param ray origin에서 direction 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param triangle 교점을 구할 triangle
 * @param epsilon 수치 비교 tolerance
 */
export function singleIntersectionRayTriangleInto(
  out: XYWritable,
  ray: RayLike,
  triangle: TriangleLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const origin = readRayOrigin(ray);
  const dir = readRayDirection(ray);
  const lineParam = rayToLineFamilyParam(readX(origin), readY(origin), readX(dir), readY(dir));
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  return lineFamilyTriangleIntersectionPoint(out, lineParam, ax, ay, bx, by, cx, cy, epsilon);
}
