import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { lineFamilyEllipseIntersectionPoints } from '../internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readX, readY } from '../internal/xy';
import type { CircleLike, InfiniteLineLike, XYObjectWritable } from '../types';

/**
 * infinite-line과 circle circumference의 모든 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * circle을 radiusX=radiusY인 ellipse로 환원해 line-family × ellipse 정책과 동일하게 계산한다.
 * single-intersection helper와 달리 교점이 2개여도 두 점을 모두 push한다.
 * - tangent는 중복 없이 한 점, proper two-point는 두 점을 line parameter `t` 오름차순으로 push한다.
 * - no hit, degenerate direction(zero-length), empty circle(radius ≤ 0)은 빈 배열을 남긴다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }`
 * object이며 입력 point object를 재사용하지 않는다.
 * `epsilon`은 discriminant tangent 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param outPoints 교점 object를 기록할 writable output array (호출 전 내용은 비워진다)
 * @param line 교점을 구할 infinite-line (전체 finite t 범위)
 * @param circle 교점을 구할 circle
 * @param epsilon discriminant tangent 판정 임계값
 */
export function infiniteLineCircleIntersectionsInto(
  outPoints: XYObjectWritable[],
  line: InfiniteLineLike,
  circle: CircleLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const origin = readInfiniteLineOrigin(line);
  const direction = readInfiniteLineDirection(line);
  const center = readCircleCenter(circle);
  const radius = readCircleRadius(circle);
  return lineFamilyEllipseIntersectionPoints(
    outPoints,
    readX(origin),
    readY(origin),
    readX(direction),
    readY(direction),
    'inf',
    readX(center),
    readY(center),
    radius,
    radius,
    epsilon
  );
}
