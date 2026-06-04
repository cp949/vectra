import { lineFamilyBoxIntersects, rayToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { readX, readY } from '../internal/xy';
import type { RayLike, RectLike } from '../types';

/**
 * rect와 ray가 교차하거나 접하면 true를 반환한다.
 *
 * rect 4변과의 line-family intersection으로 판정한다.
 * empty rect (width ≤ 0 또는 height ≤ 0): false.
 *
 * @param rect 교차를 검사할 rect
 * @param ray 교차를 검사할 ray
 * @param epsilon 수치 비교 tolerance
 */
export function intersectsRectRay(rect: RectLike, ray: RayLike, epsilon = DEFAULT_EPSILON): boolean {
  const rw = readRectWidth(rect);
  const rh = readRectHeight(rect);
  if (rw <= 0 || rh <= 0) return false;
  const origin = readRayOrigin(ray);
  const dir = readRayDirection(ray);
  const lineParam = rayToLineFamilyParam(readX(origin), readY(origin), readX(dir), readY(dir));
  const rx = readRectX(rect);
  const ry = readRectY(rect);
  return lineFamilyBoxIntersects(lineParam, rx, ry, rx + rw, ry + rh, epsilon);
}
