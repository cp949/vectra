import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { readX, readY } from '../internal/xy';
import type { CircleLike, RectLike } from '../types';

/**
 * circle과 rect가 교차하거나 접하면 true를 반환한다.
 *
 * rect 내부에서 circle center에 가장 가까운 점과의 거리로 판정한다.
 * radius ≤ 0인 circle: false.
 * width ≤ 0 또는 height ≤ 0인 rect: false.
 * closed boundary 포함 (접점도 true).
 *
 * @param circle 교차를 판정할 circle
 * @param rect 교차를 판정할 rect
 */
export function intersectsCircleRect(circle: CircleLike, rect: RectLike): boolean {
  const rectX = readRectX(rect);
  const rectY = readRectY(rect);
  const rectWidth = readRectWidth(rect);
  const rectHeight = readRectHeight(rect);
  const radius = readCircleRadius(circle);
  if (radius <= 0) return false;
  if (rectWidth <= 0 || rectHeight <= 0) return false;

  const cx = readX(readCircleCenter(circle));
  const cy = readY(readCircleCenter(circle));
  const nearX = Math.max(rectX, Math.min(cx, rectX + rectWidth));
  const nearY = Math.max(rectY, Math.min(cy, rectY + rectHeight));
  const dx = cx - nearX;
  const dy = cy - nearY;
  return dx * dx + dy * dy <= radius * radius;
}
