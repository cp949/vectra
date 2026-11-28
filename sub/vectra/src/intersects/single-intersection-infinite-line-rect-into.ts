import { infiniteLineToLineFamilyParam, lineFamilyBoxIntersectionPoint } from '../internal/line-family';
import type { InfiniteLine, Rect, PointWritable } from '../types/flat-shapes.internal';

/**
 * infinite-line과 rect의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * 교점이 2개 이상이거나 collinear, empty rect이면 false를 반환하고 out을 수정하지 않는다.
 */
export function singleIntersectionInfiniteLineRectInto(
  out: PointWritable,
  infiniteLine: InfiniteLine,
  rect: Rect,
  epsilon?: number
): boolean {
  const rw = rect.width;
  const rh = rect.height;
  if (rw <= 0 || rh <= 0) return false;
  const lineParam = infiniteLineToLineFamilyParam(infiniteLine.ox, infiniteLine.oy, infiniteLine.dx, infiniteLine.dy);
  const rx = rect.x;
  const ry = rect.y;
  return lineFamilyBoxIntersectionPoint(out, lineParam, rx, ry, rx + rw, ry + rh, epsilon);
}
