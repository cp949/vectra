import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readX, readY } from '../internal/xy';
import type { EllipseLike, XYObjectWritable } from '../types';
import { ellipseEllipseDetailXY } from './ellipse-ellipse-detail.internal';

/**
 * 두 axis-aligned ellipse boundary의 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * `ellipseEllipseDetail`과 같은 계산을 source로 쓰고 boundary 교점만 점으로 노출한다.
 * - tangent(`point`)는 한 점, proper 2점(`two-point`)은 두 점, 3~4점(`multi-point`)은 모든 점을
 *   ellipse `a` 기준 turn 오름차순으로 push한다.
 * - 외부 분리, boundary 교점 없는 disjoint(`none`), 한 ellipse가 다른 ellipse 내부에 있는
 *   containment(`contains`), coincident(`overlap`), empty ellipse(radiusX/radiusY ≤ 0), non-finite는
 *   점으로 표현할 수 없어 빈 결과를 남긴다. coincident overlap에서 임의 점을 만들지 않는다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }`
 * object이며 입력 center object를 재사용하지 않는다.
 * `epsilon`은 coincident/tangent/containment 판정에만 쓰고 finite validation에는 쓰지 않는다.
 * `epsilon`은 절대 임계값이며 두 radius보다 충분히 작다고 가정한다.
 *
 * @param outPoints 교점 object를 기록할 writable output array (호출 전 내용은 비워진다)
 * @param a 첫 번째 ellipse. point ordering의 기준이다.
 * @param b 두 번째 ellipse
 * @param epsilon coincident / tangent / containment 판정 임계값
 */
export function ellipseEllipseIntersectionsInto(
  outPoints: XYObjectWritable[],
  a: EllipseLike,
  b: EllipseLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const ca = readEllipseCenter(a);
  const cb = readEllipseCenter(b);
  const detail = ellipseEllipseDetailXY(
    readX(ca),
    readY(ca),
    readEllipseRadiusX(a),
    readEllipseRadiusY(a),
    readX(cb),
    readY(cb),
    readEllipseRadiusX(b),
    readEllipseRadiusY(b),
    epsilon
  );

  outPoints.length = 0;
  if (detail.kind === 'point') {
    outPoints.push({ x: detail.point.x, y: detail.point.y });
  } else if (detail.kind === 'two-point') {
    outPoints.push({ x: detail.points[0].x, y: detail.points[0].y });
    outPoints.push({ x: detail.points[1].x, y: detail.points[1].y });
  } else if (detail.kind === 'multi-point') {
    for (const point of detail.points) {
      outPoints.push({ x: point.x, y: point.y });
    }
  }

  return outPoints;
}
