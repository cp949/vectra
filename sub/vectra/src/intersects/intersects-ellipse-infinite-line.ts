import { lineFamilyEllipseIntersects } from '../internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Ellipse, InfiniteLine } from '../types/flat-shapes.internal';

/**
 * ellipse와 infinite-line이 교차하거나 접하면 true를 반환한다.
 *
 * tangent, 2-point crossing 모두 true.
 * degenerate ellipse (rx ≤ 0 또는 ry ≤ 0): false.
 * degenerate direction (= 0): origin이 ellipse 경계/내부이면 true.
 *
 * @param ellipse 교차를 검사할 ellipse
 * @param line 교차를 검사할 infinite-line
 * @param epsilon 수치 비교 tolerance
 */
export function intersectsEllipseInfiniteLine(
  ellipse: Ellipse,
  line: InfiniteLine,
  epsilon = DEFAULT_EPSILON
): boolean {
  return lineFamilyEllipseIntersects(
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
