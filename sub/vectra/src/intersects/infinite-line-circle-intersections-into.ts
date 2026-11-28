import { lineFamilyEllipseIntersectionPoints } from '../internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Circle, InfiniteLine, PointWritable } from '../types/flat-shapes.internal';

/**
 * infinite-line과 circle circumference의 모든 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * circle을 rx = ry = r인 ellipse로 환원해 line-family × ellipse 정책과 동일하게 계산한다.
 * single-intersection helper와 달리 교점이 2개여도 두 점을 모두 push한다.
 * - tangent는 중복 없이 한 점, proper two-point는 두 점을 line parameter `t` 오름차순으로 push한다.
 * - no hit, degenerate direction(`dx = dy = 0`), empty circle(r ≤ 0)은 빈 배열을 남긴다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }`
 * object다.
 * `epsilon`은 discriminant tangent 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param outPoints 교점을 기록할 배열. 기존 내용은 비우고 { x, y } 점을 넣는다.
 * @param line 교점을 구할 infinite-line (전체 finite t 범위)
 * @param circle 교점을 구할 circle
 * @param epsilon discriminant tangent 판정 임계값
 */
export function infiniteLineCircleIntersectionsInto(
  outPoints: PointWritable[],
  line: InfiniteLine,
  circle: Circle,
  epsilon = DEFAULT_EPSILON
): PointWritable[] {
  const radius = circle.r;
  lineFamilyEllipseIntersectionPoints(
    outPoints,
    line.ox,
    line.oy,
    line.dx,
    line.dy,
    'inf',
    circle.cx,
    circle.cy,
    radius,
    radius,
    epsilon
  );
  return outPoints;
}
