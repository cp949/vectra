import { capsuleAxisDistanceXY, validateCapsuleRadius } from '../internal/capsule';
import type { Capsule, Point } from '../types/flat-shapes.internal';

/**
 * point와 capsule closed region 사이 unsigned 최단 거리를 반환한다.
 *
 * `Math.max(0, axisDistance - radius)`다. 내부와 boundary point는 `0`이다. zero-axis
 * capsule(두 끝점 좌표가 같음)은 시작점 `(x1, y1)`와 radius `r`의 circle distance와 같다. signed distance는
 * `sdf.sdfCapsule` owner다. `r < 0`와 non-finite radius는 `RangeError`다. endpoint 좌표
 * non-finite는 별도 검증하지 않고 산술 결과를 따른다.
 *
 * @param capsule 거리를 측정할 capsule
 * @param point capsule까지의 거리를 측정할 point
 */
export function distanceToPoint(capsule: Capsule, point: Point): number {
  const r = validateCapsuleRadius(capsule.r);
  const { x1, y1, x2, y2 } = capsule;
  const px = point.x;
  const py = point.y;
  const axisDistance = capsuleAxisDistanceXY(x1, y1, x2, y2, px, py);
  return Math.max(0, axisDistance - r);
}
