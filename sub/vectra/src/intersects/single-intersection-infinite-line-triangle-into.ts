import { infiniteLineToLineFamilyParam, lineFamilyTriangleIntersectionPoint } from '../internal/line-family';
import type { InfiniteLine, Triangle, PointWritable } from '../types/flat-shapes.internal';

/**
 * infinite-line과 triangle의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * 교점이 2개 이상이거나 degenerate triangle이면 false를 반환하고 out을 수정하지 않는다.
 */
export function singleIntersectionInfiniteLineTriangleInto(
  out: PointWritable,
  infiniteLine: InfiniteLine,
  triangle: Triangle,
  epsilon?: number
): boolean {
  const lineParam = infiniteLineToLineFamilyParam(infiniteLine.ox, infiniteLine.oy, infiniteLine.dx, infiniteLine.dy);
  const { x1: ax, y1: ay, x2: bx, y2: by, x3: cx, y3: cy } = triangle;
  return lineFamilyTriangleIntersectionPoint(out, lineParam, ax, ay, bx, by, cx, cy, epsilon);
}
