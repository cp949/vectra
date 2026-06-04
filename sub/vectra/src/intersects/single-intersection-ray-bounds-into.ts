import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { lineFamilyBoxIntersectionPoint, rayToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readX, readY } from '../internal/xy';
import type { BoundsLike, RayLike, XYWritable } from '../types';

/**
 * ray와 bounds의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * 교점이 2개 이상이거나 collinear이면 false를 반환하고 out을 수정하지 않는다.
 * inverted bounds (max < min): false. aliasing 불가.
 *
 * @param out 교점 좌표를 기록할 writable output
 * @param ray origin에서 direction 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param bounds 교점을 구할 axis-aligned bounding box
 * @param epsilon 수치 비교 tolerance
 */
export function singleIntersectionRayBoundsInto(
  out: XYWritable,
  ray: RayLike,
  bounds: BoundsLike,
  epsilon = DEFAULT_EPSILON
): boolean {
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
  return lineFamilyBoxIntersectionPoint(out, lineParam, x0, y0, x1, y1, epsilon);
}
