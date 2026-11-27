import type { Circle, Point } from '../types/flat-shapes.internal';
import { requireFinite, requireNonNegative } from './primitive.internal';
import { hypot2 } from '../internal/numeric';

/**
 * circle과 point 사이의 signed distance를 반환한다.
 *
 * `hypot(point - center) - radius`다. interior는 음수, boundary는 0, exterior는 양수다.
 * `radius === 0`은 center까지의 거리와 같다.
 *
 * 모든 좌표와 radius는 finite여야 한다. non-finite center/point 좌표, `radius < 0`,
 * non-finite radius는 `RangeError`다.
 *
 * @param circle signed distance를 측정할 circle
 * @param point circle까지의 signed distance를 측정할 point
 */
export function sdfCircle(circle: Circle, point: Point): number {
  const cx = requireFinite(circle.cx, 'circle center x');
  const cy = requireFinite(circle.cy, 'circle center y');
  const radius = requireNonNegative(circle.r, 'circle radius');
  const px = requireFinite(point.x, 'point x');
  const py = requireFinite(point.y, 'point y');

  return hypot2(px - cx, py - cy) - radius;
}
