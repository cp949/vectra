import { lineFamilyEllipseIntersectionPoints } from '../internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Circle, Segment, PointWritable } from '../types/flat-shapes.internal';

/**
 * segment와 circle circumference의 range 안 모든 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * circle을 rx = ry = r인 ellipse로 환원해 line-family × ellipse 정책과 동일하게 계산한다.
 * single-intersection helper와 달리 range(`t in [0, 1]`) 안 교점이 2개여도 두 점을 모두 push한다.
 * - tangent는 접점 t가 range 안일 때만 중복 없이 한 점이고, range 밖이면 빈 배열이다.
 * - proper two-point는 두 점을 segment parameter `t` 오름차순으로 push한다.
 * - segment 전체가 circle 내부(boundary root 없음), zero-length segment, empty circle(r ≤ 0)은
 *   빈 배열을 남긴다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }`
 * object이며 입력 point object를 재사용하지 않는다.
 * `epsilon`은 discriminant tangent 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param outPoints 교점을 기록할 배열. 기존 내용은 비우고 { x, y } 점을 넣는다.
 * @param segment 교점을 구할 segment
 * @param circle 교점을 구할 circle
 * @param epsilon discriminant tangent 판정 임계값
 */
export function segmentCircleIntersectionsInto(
  outPoints: PointWritable[],
  segment: Segment,
  circle: Circle,
  epsilon = DEFAULT_EPSILON
): PointWritable[] {
  const radius = circle.r;
  lineFamilyEllipseIntersectionPoints(
    outPoints,
    segment.x1,
    segment.y1,
    segment.x2 - segment.x1,
    segment.y2 - segment.y1,
    'finite',
    circle.cx,
    circle.cy,
    radius,
    radius,
    epsilon
  );
  return outPoints;
}
