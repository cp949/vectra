import { lineFamilyEllipseIntersects } from '../internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Ellipse, Segment } from '../types/flat-shapes.internal';

/**
 * ellipse와 segment가 교차하거나 접하면 true를 반환한다.
 *
 * closed disk 판정. tangent, 2-point crossing, segment endpoint 내부 포함 모두 true.
 * degenerate ellipse (rx ≤ 0 또는 ry ≤ 0): false.
 * degenerate segment (a === b): a가 ellipse 경계/내부이면 true.
 *
 * @param ellipse 교차를 검사할 ellipse
 * @param line 교차를 검사할 segment
 * @param epsilon 수치 비교 tolerance
 */
export function intersectsEllipseSegment(ellipse: Ellipse, line: Segment, epsilon = DEFAULT_EPSILON): boolean {
  return lineFamilyEllipseIntersects(
    line.x1,
    line.y1,
    line.x2 - line.x1,
    line.y2 - line.y1,
    'finite',
    ellipse.cx,
    ellipse.cy,
    ellipse.rx,
    ellipse.ry,
    epsilon
  );
}
