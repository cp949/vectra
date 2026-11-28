import { infiniteLineToLineFamilyParam, lineFamilyTriangleIntersectionPoint } from '../internal/line-family';
import type { InfiniteLine, Triangle, PointWritable } from '../types/flat-shapes.internal';

/**
 * infinite-line과 triangle의 단일 교점을 새 object로 반환한다.
 *
 * 교점이 2개 이상이거나 degenerate triangle이면 undefined를 반환한다.
 * allocating companion — internal helper를 직접 호출한다.
 */
export function singleIntersectionInfiniteLineTriangle(
  infiniteLine: InfiniteLine,
  triangle: Triangle,
  epsilon?: number
): PointWritable | undefined {
  const lineParam = infiniteLineToLineFamilyParam(infiniteLine.ox, infiniteLine.oy, infiniteLine.dx, infiniteLine.dy);
  const { x1: ax, y1: ay, x2: bx, y2: by, x3: cx, y3: cy } = triangle;
  const out: PointWritable = { x: 0, y: 0 };
  return lineFamilyTriangleIntersectionPoint(out, lineParam, ax, ay, bx, by, cx, cy, epsilon) ? out : undefined;
}
