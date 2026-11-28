import { closedEllipseBoundaryIntersectionPoints } from '../internal/closed-ellipse-boundary';
import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Circle, Rect, PointWritable } from '../types/flat-shapes.internal';

/**
 * circle circumference와 rect boundary의 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * rect boundary 4개 edge와 circle의 교점을 모으고 corner/tangent 중복을 dedupe한다. boundary 교점만
 * 점으로 노출하므로, circle이 rect를 완전히 포함하거나 rect가 circle을 완전히 포함해 boundary 교점이
 * 없으면 빈 배열이다. edge crossing은 2점, corner/tangent touch는 dedupe된 1점이다.
 * empty circle(radius ≤ 0), empty rect(width ≤ 0 또는 height ≤ 0)는 빈 배열을 남긴다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }` object다. 반환 순서는 circle center 기준 normalized turn 오름차순이다.
 * `epsilon`은 tangent/dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param outPoints 교점을 기록할 배열. 기존 내용은 비우고 { x, y } 점을 넣는다.
 * @param circle 교점을 구할 circle. point ordering의 기준이다.
 * @param rect 교점을 구할 rect (axis-aligned)
 * @param epsilon tangent/dedupe 판정 임계값
 */
export function circleRectIntersectionsInto<Out extends PointWritable[]>(
  outPoints: Out,
  circle: Circle,
  rect: Rect,
  epsilon = DEFAULT_EPSILON
): Out {
  outPoints.length = 0;
  const rw = rect.width;
  const rh = rect.height;
  if (rw <= 0 || rh <= 0) return outPoints;
  const rx = rect.x;
  const ry = rect.y;
  const x1 = rx + rw;
  const y1 = ry + rh;
  const radius = circle.r;
  closedEllipseBoundaryIntersectionPoints(
    outPoints,
    [
      { x0: rx, y0: ry, x1, y1: ry },
      { x0: x1, y0: ry, x1, y1 },
      { x0: x1, y0: y1, x1: rx, y1 },
      { x0: rx, y0: y1, x1: rx, y1: ry },
    ],
    circle.cx,
    circle.cy,
    radius,
    radius,
    epsilon
  );
  return outPoints;
}
