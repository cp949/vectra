import { infiniteLineToLineFamilyParam, lineFamilyCircleIntersectionPoint } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Circle, InfiniteLine, PointWritable } from '../types/flat-shapes.internal';

/**
 * infinite-line과 circle의 단일 교점을 새 object로 반환한다.
 *
 * tangent이면 접점 object를 반환한다. 2-point crossing이면 undefined.
 * empty circle (radius ≤ 0): undefined.
 * allocating companion — internal helper를 직접 호출한다.
 */
export function singleIntersectionInfiniteLineCircle(
  infiniteLine: InfiniteLine,
  circle: Circle,
  epsilon = DEFAULT_EPSILON
): PointWritable | undefined {
  const lineParam = infiniteLineToLineFamilyParam(infiniteLine.ox, infiniteLine.oy, infiniteLine.dx, infiniteLine.dy);
  const out: PointWritable = { x: 0, y: 0 };
  return lineFamilyCircleIntersectionPoint(out, lineParam, circle.cx, circle.cy, circle.r, epsilon) ? out : undefined;
}
