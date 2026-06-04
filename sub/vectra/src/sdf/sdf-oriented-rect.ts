import { readOrientedRectAngle, readOrientedRectCenter, readOrientedRectSize } from '../internal/oriented-rect';
import { readX, readY } from '../internal/xy';
import type { OrientedRectLike, XYInput } from '../types';
import {
  canonicalizeZero,
  requireFinite,
  requireFiniteX,
  requireFiniteY,
  requireNonNegative,
} from './primitive.internal';

/**
 * oriented rect(OBB)와 point 사이의 signed distance를 반환한다.
 *
 * point를 oriented rect local-space로 회전 변환한 뒤 half-extent box signed distance를 계산한다.
 * local axis convention은 `localX = dx*cos + dy*sin`, `localY = -dx*sin + dy*cos`다. interior는 nearest
 * edge까지의 음수 거리, boundary는 0, exterior는 nearest edge/corner까지의 양수 거리다. angle 0이면
 * 같은 region axis-aligned rect와 같은 값을 반환한다.
 *
 * zero width/height는 interior가 없는 degenerate region(segment 또는 point)으로 처리한다. region 위
 * point는 0, 밖은 양수 거리다.
 *
 * 모든 좌표와 size, angle은 finite여야 한다. non-finite center/size/angle/point 좌표, negative
 * width/height는 `RangeError`다.
 *
 * @param rect signed distance를 측정할 oriented rect
 * @param point oriented rect까지의 signed distance를 측정할 point
 */
export function sdfOrientedRect(rect: OrientedRectLike, point: XYInput): number {
  const center = readOrientedRectCenter(rect);
  const cx = requireFiniteX(center, 'oriented rect center');
  const cy = requireFiniteY(center, 'oriented rect center');
  const size = readOrientedRectSize(rect);
  const width = requireNonNegative(readX(size), 'oriented rect width');
  const height = requireNonNegative(readY(size), 'oriented rect height');
  const angle = requireFinite(readOrientedRectAngle(rect), 'oriented rect angle');
  const px = requireFiniteX(point, 'point');
  const py = requireFiniteY(point, 'point');

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = px - cx;
  const dy = py - cy;
  const localX = dx * cos + dy * sin;
  const localY = -dx * sin + dy * cos;

  // half-extent box signed distance (Quilez 2D box SDF)
  const qx = Math.abs(localX) - width / 2;
  const qy = Math.abs(localY) - height / 2;
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  const inside = Math.min(Math.max(qx, qy), 0);

  return canonicalizeZero(outside + inside);
}
