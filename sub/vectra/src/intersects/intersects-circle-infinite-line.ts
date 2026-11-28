import { infiniteLineToLineFamilyParam, lineFamilyCircleIntersects } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Circle, InfiniteLine } from '../types/flat-shapes.internal';

/**
 * circle과 infinite-line이 교차하거나 접하면 true를 반환한다.
 *
 * closed disk 판정. tangent, 2-point crossing 모두 true.
 * r ≤ 0인 circle: false.
 *
 * @param circle 교차를 판정할 circle
 * @param infiniteLine 교차를 판정할 infinite line
 * @param epsilon 부동소수점 비교에 사용할 tolerance
 */
export function intersectsCircleInfiniteLine(
  circle: Circle,
  infiniteLine: InfiniteLine,
  epsilon = DEFAULT_EPSILON
): boolean {
  const lineParam = infiniteLineToLineFamilyParam(infiniteLine.ox, infiniteLine.oy, infiniteLine.dx, infiniteLine.dy);
  return lineFamilyCircleIntersects(lineParam, circle.cx, circle.cy, circle.r, epsilon);
}
