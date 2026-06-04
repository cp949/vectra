import { closedEllipseBoundaryIntersectionPoints } from '../internal/closed-ellipse-boundary';
import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { hasNonFiniteVertex, readTriangleRawCoords, triangleSignedArea2x } from '../internal/triangle';
import { readX, readY } from '../internal/xy';
import type { EllipseLike, TriangleLike, XYObjectWritable } from '../types';

/**
 * ellipse circumference와 triangle boundary의 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * triangle boundary 3개 edge와 ellipse의 교점을 모으고 vertex/tangent 중복을 dedupe한다. boundary 교점만
 * 점으로 노출하므로, ellipse가 triangle을 완전히 포함하거나 triangle이 ellipse를 완전히 포함해 boundary
 * 교점이 없으면 빈 배열이다. edge crossing은 edge별 최대 2점, vertex/tangent touch는 dedupe된 1점이다.
 * empty ellipse(radiusX/radiusY ≤ 0), degenerate triangle(signed area 2× === 0), non-finite vertex는
 * 빈 배열을 남긴다. axis-aligned ellipse만 지원한다(rotated ellipse 비범위).
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }` object이며
 * 입력 center/vertex object를 재사용하지 않는다. 반환 순서는 ellipse center 기준 normalized turn
 * 오름차순이다. `epsilon`은 tangent/dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param outPoints 교점 object를 기록할 writable output array (호출 전 내용은 비워진다)
 * @param ellipse 교점을 구할 ellipse (axis-aligned). point ordering의 기준이다.
 * @param triangle 교점을 구할 triangle
 * @param epsilon tangent/dedupe 판정 임계값
 */
export function ellipseTriangleIntersectionsInto(
  outPoints: XYObjectWritable[],
  ellipse: EllipseLike,
  triangle: TriangleLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  outPoints.length = 0;
  if (hasNonFiniteVertex(triangle) || triangleSignedArea2x(triangle) === 0) return outPoints;
  const t = readTriangleRawCoords(triangle);
  const center = readEllipseCenter(ellipse);
  return closedEllipseBoundaryIntersectionPoints(
    outPoints,
    [
      { x0: t.ax, y0: t.ay, x1: t.bx, y1: t.by },
      { x0: t.bx, y0: t.by, x1: t.cx, y1: t.cy },
      { x0: t.cx, y0: t.cy, x1: t.ax, y1: t.ay },
    ],
    readX(center),
    readY(center),
    readEllipseRadiusX(ellipse),
    readEllipseRadiusY(ellipse),
    epsilon
  );
}
