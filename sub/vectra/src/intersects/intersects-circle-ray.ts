import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { lineFamilyCircleIntersects, rayToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readX, readY } from '../internal/xy';
import type { CircleLike, RayLike } from '../types';

/**
 * circle과 ray가 교차하거나 접하면 true를 반환한다.
 *
 * closed disk 판정. ray origin이 disk 내부이면 true.
 * radius ≤ 0인 circle: false.
 *
 * @param circle 교차를 판정할 circle
 * @param ray 교차를 판정할 ray
 * @param epsilon 부동소수점 비교에 사용할 tolerance
 */
export function intersectsCircleRay(circle: CircleLike, ray: RayLike, epsilon = DEFAULT_EPSILON): boolean {
  const origin = readRayOrigin(ray);
  const dir = readRayDirection(ray);
  const lineParam = rayToLineFamilyParam(readX(origin), readY(origin), readX(dir), readY(dir));
  const center = readCircleCenter(circle);
  return lineFamilyCircleIntersects(lineParam, readX(center), readY(center), readCircleRadius(circle), epsilon);
}
