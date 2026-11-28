import { infiniteLineToLineFamilyParam, lineFamilyBoxIntersectionPoint } from '../internal/line-family';
import type { Bounds, InfiniteLine, PointWritable } from '../types/flat-shapes.internal';

/**
 * infinite-line과 bounds의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * 교점이 2개 이상이거나 collinear, inverted bounds이면 false를 반환하고 out을 수정하지 않는다.
 */
export function singleIntersectionInfiniteLineBoundsInto(
  out: PointWritable,
  infiniteLine: InfiniteLine,
  bounds: Bounds,
  epsilon?: number
): boolean {
  const x0 = bounds.minX;
  const y0 = bounds.minY;
  const x1 = bounds.maxX;
  const y1 = bounds.maxY;
  if (x1 < x0 || y1 < y0) return false;
  const lineParam = infiniteLineToLineFamilyParam(infiniteLine.ox, infiniteLine.oy, infiniteLine.dx, infiniteLine.dy);
  return lineFamilyBoxIntersectionPoint(out, lineParam, x0, y0, x1, y1, epsilon);
}
