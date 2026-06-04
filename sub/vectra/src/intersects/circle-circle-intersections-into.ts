import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readX, readY } from '../internal/xy';
import type { CircleLike, XYObjectWritable } from '../types';
import { circleCircleDetailXY } from './circle-circle-intersections.internal';

/**
 * 두 circle circumference의 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * `circleCircleDetail`과 같은 계산을 source로 쓰고 point relation만 점으로 노출한다.
 * - tangent(`point`)는 한 점, proper two-point는 circle `a` 기준 turn 오름차순 두 점을 push한다.
 * - 외부 분리, containment, coincident overlap, radius ≤ 0, non-finite는 점으로 표현할 수 없어
 *   빈 결과를 남긴다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }`
 * object이며 입력 center object를 재사용하지 않는다.
 * `epsilon`은 center distance 비교와 tangent 판정에만 쓰고 finite validation에는 쓰지 않는다.
 * 계산은 공통 scale로 정규화해 `d²`/`r²` overflow를 피한다.
 * `epsilon`은 절대 임계값이며 두 radius보다 충분히 작다고 가정한다. radius가 `epsilon` 규모 이하면
 * 분리/접선 경계가 합쳐져 분리된 circle을 `point`로 분류할 수 있다.
 *
 * @param outPoints 교점 object를 기록할 writable output array (호출 전 내용은 비워진다)
 * @param a 첫 번째 circle. point ordering의 기준이다.
 * @param b 두 번째 circle
 * @param epsilon center distance 및 tangent 판정 임계값
 */
export function circleCircleIntersectionsInto(
  outPoints: XYObjectWritable[],
  a: CircleLike,
  b: CircleLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const ca = readCircleCenter(a);
  const cb = readCircleCenter(b);
  const detail = circleCircleDetailXY(
    readX(ca),
    readY(ca),
    readX(cb),
    readY(cb),
    readCircleRadius(a),
    readCircleRadius(b),
    epsilon
  );

  outPoints.length = 0;
  if (detail.kind === 'point') {
    outPoints.push({ x: detail.point.x, y: detail.point.y });
  } else if (detail.kind === 'two-point') {
    outPoints.push({ x: detail.points[0].x, y: detail.points[0].y });
    outPoints.push({ x: detail.points[1].x, y: detail.points[1].y });
  }

  return outPoints;
}
