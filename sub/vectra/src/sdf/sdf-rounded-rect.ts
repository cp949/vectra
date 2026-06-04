import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import type { RectLike, XYInput } from '../types';
import {
  canonicalizeZero,
  requireFinite,
  requireFiniteX,
  requireFiniteY,
  requireNonNegative,
  signedInsetIntervalDistance,
} from './primitive.internal';

/**
 * uniform corner radius rounded rect와 point 사이의 signed distance를 반환한다.
 *
 * axis-aligned rect를 corner radius로 inset한 box signed distance에서 radius를 빼는 형태다. interior는
 * nearest edge/arc까지의 음수 거리, straight edge와 rounded corner boundary는 0, exterior는 양수 거리다.
 * `radius === 0`은 같은 region `sdfRect`와 같은 값이다.
 *
 * effective radius는 `min(radius, width / 2, height / 2)`로 clamp한다. 따라서 radius가 절반 크기를
 * 넘어도 rect 안에 맞는 최대 radius로 처리한다. `width === 0 || height === 0`이면 effective radius가 0이
 * 되어 interior 없는 degenerate rect(segment 또는 point) SDF를 반환한다.
 *
 * 모든 좌표와 size, radius는 finite여야 한다. non-finite rect/point 좌표, negative/non-finite
 * width/height, `radius < 0`, non-finite radius는 `RangeError`다.
 *
 * @param rect signed distance를 측정할 axis-aligned rect
 * @param radius uniform corner radius. `min(radius, width / 2, height / 2)`로 clamp한다
 * @param point rounded rect까지의 signed distance를 측정할 point
 */
export function sdfRoundedRect(rect: RectLike, radius: number, point: XYInput): number {
  const rx = requireFinite(readRectX(rect), 'rect x');
  const ry = requireFinite(readRectY(rect), 'rect y');
  const width = requireNonNegative(readRectWidth(rect), 'rect width');
  const height = requireNonNegative(readRectHeight(rect), 'rect height');
  const r = requireNonNegative(radius, 'rounded rect radius');
  const px = requireFiniteX(point, 'point');
  const py = requireFiniteY(point, 'point');

  const hw = width / 2;
  const hh = height / 2;
  const effectiveRadius = Math.min(r, hw, hh);
  const dx = signedInsetIntervalDistance(rx, width, effectiveRadius, px);
  const dy = signedInsetIntervalDistance(ry, height, effectiveRadius, py);
  if (dx > 0 || dy > 0) {
    return canonicalizeZero(Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) - effectiveRadius);
  }

  return canonicalizeZero(Math.max(dx, dy) - effectiveRadius);
}
