import { lineFamilyTriangleIntersectionPoint, rayToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readTriangleRawCoords } from '../internal/triangle';
import { readX, readY } from '../internal/xy';
import type { RayLike, TriangleLike, XYObjectWritable } from '../types';

/**
 * ray와 triangle의 단일 교점을 새 object로 반환한다.
 *
 * 교점이 없거나 2개 이상이면 undefined를 반환한다.
 * degenerate triangle (꼭짓점이 collinear이거나 coincident): undefined.
 * allocating companion — internal helper를 직접 호출한다.
 *
 * @param ray origin에서 direction 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param triangle 교점을 구할 triangle
 * @param epsilon 수치 비교 tolerance
 */
export function singleIntersectionRayTriangle(
  ray: RayLike,
  triangle: TriangleLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable | undefined {
  const origin = readRayOrigin(ray);
  const dir = readRayDirection(ray);
  const lineParam = rayToLineFamilyParam(readX(origin), readY(origin), readX(dir), readY(dir));
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  const out: XYObjectWritable = { x: 0, y: 0 };
  return lineFamilyTriangleIntersectionPoint(out, lineParam, ax, ay, bx, by, cx, cy, epsilon) ? out : undefined;
}
