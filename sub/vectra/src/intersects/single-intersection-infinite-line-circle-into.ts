import { infiniteLineToLineFamilyParam, lineFamilyCircleIntersectionPoint } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Circle, InfiniteLine, PointWritable } from '../types/flat-shapes.internal';

/**
 * infinite-line과 circle의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * tangent이면 접점을 기록한다. 2-point crossing이면 false (out 미수정).
 * empty circle (radius ≤ 0): false.
 */
export function singleIntersectionInfiniteLineCircleInto(
  out: PointWritable,
  infiniteLine: InfiniteLine,
  circle: Circle,
  epsilon = DEFAULT_EPSILON
): boolean {
  const lineParam = infiniteLineToLineFamilyParam(infiniteLine.ox, infiniteLine.oy, infiniteLine.dx, infiniteLine.dy);
  return lineFamilyCircleIntersectionPoint(out, lineParam, circle.cx, circle.cy, circle.r, epsilon);
}
