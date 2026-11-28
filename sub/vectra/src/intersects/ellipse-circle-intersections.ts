import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Circle, Ellipse, PointWritable } from '../types/flat-shapes.internal';
import { ellipseCircleIntersectionsInto } from './ellipse-circle-intersections-into';

/**
 * ellipse circumference와 circle circumference의 교점을 새 배열로 반환한다.
 *
 * `ellipseCircleIntersectionsInto`의 allocating companion이다. boundary 교점만 노출한다.
 * - tangent는 한 점, proper 2점은 두 점, 3~4점은 모든 점을 ellipse `a` 기준 turn 오름차순으로 반환한다.
 * - 외부 분리, containment, coincident, empty ellipse/circle(rx, ry, r 중 하나라도 ≤ 0), non-finite는
 *   빈 배열을 반환한다.
 *
 * 반환 point는 매 호출 새 `{ x, y }` object다.
 * `epsilon`은 coincident/tangent/containment 판정에만 쓰고 finite validation에는 쓰지 않는다.
 * `epsilon`은 절대 임계값이며 radius보다 충분히 작다고 가정한다.
 *
 * @param ellipse 교점을 구할 ellipse. point ordering의 기준이다.
 * @param circle 교점을 구할 circle
 * @param epsilon coincident / tangent / containment 판정 임계값
 */
export function ellipseCircleIntersections(
  ellipse: Ellipse,
  circle: Circle,
  epsilon = DEFAULT_EPSILON
): PointWritable[] {
  const out: PointWritable[] = [];
  ellipseCircleIntersectionsInto(out, ellipse, circle, epsilon);
  return out;
}
