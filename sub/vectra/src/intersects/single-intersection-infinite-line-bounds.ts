import { infiniteLineToLineFamilyParam, lineFamilyBoxIntersectionPoint } from '../internal/line-family';
import type { Bounds, InfiniteLine, PointWritable } from '../types/flat-shapes.internal';

/**
 * infinite-line과 bounds의 단일 교점을 새 object로 반환한다.
 *
 * 교점이 2개 이상이거나 collinear, inverted bounds (max < min)이면 undefined를 반환한다.
 * allocating companion — internal helper를 직접 호출한다.
 */
export function singleIntersectionInfiniteLineBounds(
  infiniteLine: InfiniteLine,
  bounds: Bounds,
  epsilon?: number
): PointWritable | undefined {
  const x0 = bounds.minX;
  const y0 = bounds.minY;
  const x1 = bounds.maxX;
  const y1 = bounds.maxY;
  if (x1 < x0 || y1 < y0) return undefined;
  const lineParam = infiniteLineToLineFamilyParam(infiniteLine.ox, infiniteLine.oy, infiniteLine.dx, infiniteLine.dy);
  const out: PointWritable = { x: 0, y: 0 };
  return lineFamilyBoxIntersectionPoint(out, lineParam, x0, y0, x1, y1, epsilon) ? out : undefined;
}
