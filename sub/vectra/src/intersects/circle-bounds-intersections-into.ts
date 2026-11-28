import { closedEllipseBoundaryIntersectionPoints } from '../internal/closed-ellipse-boundary';
import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Bounds, Circle, PointWritable } from '../types/flat-shapes.internal';

/**
 * circle circumference와 bounds boundary의 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * bounds boundary 4개 edge와 circle의 교점을 모으고 corner/tangent 중복을 dedupe한다. rect helper와 계산은
 * 같으나 empty 기준이 다르다: bounds는 inverted(max < min)만 empty로 보아 zero-extent(점·선) bounds도 유효
 * 입력으로 처리한다(rect는 width/height ≤ 0을 empty). boundary 교점만 점으로 노출하므로 containment-only(circle이
 * bounds를 포함하거나 bounds가 circle을 포함)는 빈 배열이다. edge crossing은 2점, corner/tangent touch는
 * dedupe된 1점이다. empty circle(r ≤ 0), inverted bounds(max < min)는 빈 배열을 남긴다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }` object다. 반환 순서는 circle center 기준 normalized turn 오름차순이다.
 * `epsilon`은 tangent/dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param outPoints 교점을 기록할 배열. 기존 내용은 비우고 { x, y } 점을 넣는다.
 * @param circle 교점을 구할 circle. point ordering의 기준이다.
 * @param bounds 교점을 구할 bounds (axis-aligned)
 * @param epsilon tangent/dedupe 판정 임계값
 */
export function circleBoundsIntersectionsInto(
  outPoints: PointWritable[],
  circle: Circle,
  bounds: Bounds,
  epsilon = DEFAULT_EPSILON
): PointWritable[] {
  outPoints.length = 0;
  const x0 = bounds.minX;
  const y0 = bounds.minY;
  const x1 = bounds.maxX;
  const y1 = bounds.maxY;
  if (x1 < x0 || y1 < y0) return outPoints;
  const radius = circle.r;
  closedEllipseBoundaryIntersectionPoints(
    outPoints,
    [
      { x0, y0, x1, y1: y0 },
      { x0: x1, y0, x1, y1 },
      { x0: x1, y0: y1, x1: x0, y1 },
      { x0, y0: y1, x1: x0, y1: y0 },
    ],
    circle.cx,
    circle.cy,
    radius,
    radius,
    epsilon
  );
  return outPoints;
}
