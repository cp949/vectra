import { readCircleCenter, readCircleRadius } from '../internal/circle';
import type { CircleLike, XYInput } from '../types';
import { requireFiniteX, requireFiniteY, requireNonNegative } from './primitive.internal';

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
export function sdfCircle(circle: CircleLike, point: XYInput): number {
  const center = readCircleCenter(circle);
  const cx = requireFiniteX(center, 'circle center');
  const cy = requireFiniteY(center, 'circle center');
  const radius = requireNonNegative(readCircleRadius(circle), 'circle radius');
  const px = requireFiniteX(point, 'point');
  const py = requireFiniteY(point, 'point');

  return Math.hypot(px - cx, py - cy) - radius;
}
