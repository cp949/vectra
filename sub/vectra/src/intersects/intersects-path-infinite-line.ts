import { infiniteLineToLineFamilyParam } from '../internal/line-family';
import { lineFamilyPolylineIntersects } from '../internal/polyline-relation';
import { flattenPathInto } from '../path/flatten.internal';
import type { PathCommand, PathFlattenOptions } from '../types';
import type { InfiniteLine } from '../types/flat-shapes.internal';

/**
 * infinite-line과 path가 교차하면 true를 반환한다.
 *
 * - path를 polyline으로 근사한 뒤 교차 여부를 판정한다. 근사 정밀도는 options.flatness로 제어한다.
 * - open subpath는 segment sequence이다. 마지막→첫 edge는 연결되지 않는다.
 * - empty path(commands.length === 0)는 false를 반환한다.
 *
 * @param infiniteLine 교차를 검사할 infinite-line
 * @param commands     flatten할 path command sequence
 * @param options      flatten 옵션 (flatness, maxRecursion)
 */
export function intersectsPathInfiniteLine(
  commands: readonly PathCommand[],
  infiniteLine: InfiniteLine,
  options?: PathFlattenOptions
): boolean {
  if (commands.length === 0) return false;
  const lineParam = infiniteLineToLineFamilyParam(infiniteLine.ox, infiniteLine.oy, infiniteLine.dx, infiniteLine.dy);
  const tmp: { x: number; y: number }[] = [];
  flattenPathInto(tmp, commands, options);
  return lineFamilyPolylineIntersects(lineParam, tmp, undefined);
}
