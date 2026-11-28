import { lineFamilyEllipseIntersectionPoint } from '../internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Ellipse, InfiniteLine, PointWritable } from '../types/flat-shapes.internal';

/**
 * infinite-line과 ellipse의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * tangent이면 접점을 기록한다. 2-point crossing이면 false (out 미수정).
 * empty ellipse (rx ≤ 0 또는 ry ≤ 0): false.
 */
export function singleIntersectionInfiniteLineEllipseInto(
  out: PointWritable,
  line: InfiniteLine,
  ellipse: Ellipse,
  epsilon = DEFAULT_EPSILON
): boolean {
  return lineFamilyEllipseIntersectionPoint(
    out,
    line.ox,
    line.oy,
    line.dx,
    line.dy,
    'inf',
    ellipse.cx,
    ellipse.cy,
    ellipse.rx,
    ellipse.ry,
    epsilon
  );
}
