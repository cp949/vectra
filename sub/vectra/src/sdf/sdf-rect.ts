import type { Point, Rect } from '../types/flat-shapes.internal';
import { requireFinite, requireNonNegative, signedIntervalDistance } from './primitive.internal';
import { hypot2 } from '../internal/numeric';

/**
 * axis-aligned rect와 point 사이의 signed distance를 반환한다.
 *
 * closed region `[x, x+width] x [y, y+height]` 기준이다. interior는 nearest edge까지의 음수
 * 거리, boundary는 0, exterior는 nearest edge/corner까지의 양수 거리다.
 *
 * zero width/height는 interior가 없는 degenerate region(segment 또는 point)으로 처리한다.
 * region 위 point는 0, 밖은 양수 거리다.
 *
 * 모든 좌표와 size는 finite여야 한다. non-finite rect/point 좌표, negative width/height,
 * non-finite width/height는 `RangeError`다.
 *
 * @param rect signed distance를 측정할 axis-aligned rect
 * @param point rect까지의 signed distance를 측정할 point
 */
export function sdfRect(rect: Rect, point: Point): number {
  const rx = requireFinite(rect.x, 'rect x');
  const ry = requireFinite(rect.y, 'rect y');
  const width = requireNonNegative(rect.width, 'rect width');
  const height = requireNonNegative(rect.height, 'rect height');
  const px = requireFinite(point.x, 'point x');
  const py = requireFinite(point.y, 'point y');

  const dx = signedIntervalDistance(rx, width, px);
  const dy = signedIntervalDistance(ry, height, py);
  if (dx > 0 || dy > 0) return hypot2(Math.max(dx, 0), Math.max(dy, 0));

  return Math.max(dx, dy);
}
