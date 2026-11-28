import { infiniteLineToLineFamilyParam, lineFamilyBoxIntersectionPoint } from '../internal/line-family';
import type { InfiniteLine, Rect, PointWritable } from '../types/flat-shapes.internal';

/**
 * infinite-line과 rect의 단일 교점을 새 object로 반환한다.
 *
 * 교점이 2개 이상이거나 collinear, empty rect (w/h ≤ 0)이면 undefined를 반환한다.
 * allocating companion — internal helper를 직접 호출한다.
 */
export function singleIntersectionInfiniteLineRect(
  infiniteLine: InfiniteLine,
  rect: Rect,
  epsilon?: number
): PointWritable | undefined {
  const rw = rect.width;
  const rh = rect.height;
  if (rw <= 0 || rh <= 0) return undefined;
  const lineParam = infiniteLineToLineFamilyParam(infiniteLine.ox, infiniteLine.oy, infiniteLine.dx, infiniteLine.dy);
  const rx = rect.x;
  const ry = rect.y;
  const out: PointWritable = { x: 0, y: 0 };
  return lineFamilyBoxIntersectionPoint(out, lineParam, rx, ry, rx + rw, ry + rh, epsilon) ? out : undefined;
}
