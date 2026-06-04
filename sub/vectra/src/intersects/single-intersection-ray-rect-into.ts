import { lineFamilyBoxIntersectionPoint, rayToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { readX, readY } from '../internal/xy';
import type { RayLike, RectLike, XYWritable } from '../types';

/**
 * ray와 rect의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * 교점이 2개 이상이거나 collinear이면 false를 반환하고 out을 수정하지 않는다.
 * empty rect (width ≤ 0 또는 height ≤ 0): false. aliasing 불가.
 *
 * @param out 교점 좌표를 기록할 writable output
 * @param ray origin에서 direction 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param rect 교점을 구할 rect
 * @param epsilon 수치 비교 tolerance
 */
export function singleIntersectionRayRectInto(
  out: XYWritable,
  ray: RayLike,
  rect: RectLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const rw = readRectWidth(rect);
  const rh = readRectHeight(rect);
  if (rw <= 0 || rh <= 0) return false;
  const origin = readRayOrigin(ray);
  const dir = readRayDirection(ray);
  const lineParam = rayToLineFamilyParam(readX(origin), readY(origin), readX(dir), readY(dir));
  const rx = readRectX(rect);
  const ry = readRectY(rect);
  return lineFamilyBoxIntersectionPoint(out, lineParam, rx, ry, rx + rw, ry + rh, epsilon);
}
