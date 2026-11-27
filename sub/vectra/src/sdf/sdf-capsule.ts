import { capsuleAxisDistanceXY } from '../internal/capsule';
import type { Capsule, Point } from '../types/flat-shapes.internal';
import { requireFinite, requireNonNegative } from './primitive.internal';

/**
 * capsule과 point 사이의 signed distance를 반환한다.
 *
 * `axisDistance - radius`다. interior는 음수, side/cap boundary는 0, exterior는 양수다.
 * zero-axis capsule(`a === b`)은 같은 center/radius circle과 같은 값을 반환한다.
 *
 * 모든 좌표와 radius는 finite여야 한다. non-finite capsule endpoint/point 좌표, `radius < 0`,
 * non-finite radius는 `RangeError`다.
 *
 * @param capsule signed distance를 측정할 capsule
 * @param point capsule까지의 signed distance를 측정할 point
 */
export function sdfCapsule(capsule: Capsule, point: Point): number {
  const ax = requireFinite(capsule.x1, 'capsule a x');
  const ay = requireFinite(capsule.y1, 'capsule a y');
  const bx = requireFinite(capsule.x2, 'capsule b x');
  const by = requireFinite(capsule.y2, 'capsule b y');
  const radius = requireNonNegative(capsule.r, 'capsule radius');
  const px = requireFinite(point.x, 'point x');
  const py = requireFinite(point.y, 'point y');

  return capsuleAxisDistanceXY(ax, ay, bx, by, px, py) - radius;
}
