import { rayToLineFamilyParam } from '../internal/line-family';
import { lineFamilyPolylineIntersects } from '../internal/polyline-relation';
import { flattenPathInto } from '../path/flatten.internal';
import type { PathCommand, PathFlattenOptions } from '../types';
import type { Ray } from '../types/flat-shapes.internal';

/**
 * ray와 path가 교차하면 true를 반환한다.
 *
 * - path를 polyline으로 근사한 뒤 교차 여부를 판정한다. 근사 정밀도는 options.flatness로 제어한다.
 * - open subpath는 segment sequence이다. 마지막→첫 edge는 연결되지 않는다.
 * - empty path(commands.length === 0)는 false를 반환한다.
 *
 * @param ray      교차를 검사할 ray
 * @param commands flatten할 path command sequence
 * @param options  flatten 옵션 (flatness, maxRecursion)
 */
export function intersectsPathRay(commands: readonly PathCommand[], ray: Ray, options?: PathFlattenOptions): boolean {
  if (commands.length === 0) return false;
  const lineParam = rayToLineFamilyParam(ray.ox, ray.oy, ray.dx, ray.dy);
  const tmp: { x: number; y: number }[] = [];
  flattenPathInto(tmp, commands, options);
  return lineFamilyPolylineIntersects(lineParam, tmp, undefined);
}
