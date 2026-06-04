import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { lineFamilyBoxIntersects, rayToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readX, readY } from '../internal/xy';
import type { BoundsLike, RayLike } from '../types';

/**
 * bounds와 ray가 교차하거나 접하면 true를 반환한다.
 *
 * bounds 4변을 segment로 보고 각 변과의 line-family intersection을 판정한다.
 * inverted bounds (min > max): false.
 * closed boundary 포함 (접점도 true).
 *
 * @param bounds 교차를 판정할 bounds
 * @param ray 교차를 판정할 ray
 * @param epsilon 부동소수점 비교에 사용할 tolerance
 */
export function intersectsBoundsRay(bounds: BoundsLike, ray: RayLike, epsilon = DEFAULT_EPSILON): boolean {
  const min = readBoundsMin(bounds);
  const max = readBoundsMax(bounds);
  const x0 = readX(min);
  const y0 = readY(min);
  const x1 = readX(max);
  const y1 = readY(max);
  if (x1 < x0 || y1 < y0) return false;
  const origin = readRayOrigin(ray);
  const dir = readRayDirection(ray);
  const lineParam = rayToLineFamilyParam(readX(origin), readY(origin), readX(dir), readY(dir));
  return lineFamilyBoxIntersects(lineParam, x0, y0, x1, y1, epsilon);
}
