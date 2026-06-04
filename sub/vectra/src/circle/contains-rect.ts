import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { readX, readY } from '../internal/xy';
import type { CircleLike, RectLike } from '../types';

/**
 * rect의 네 corner가 모두 circle 내부나 boundary 위에 있으면 true를 반환한다.
 *
 * empty rect는 true를 반환한다. empty circle은 empty rect일 때만 true가 되며, non-empty rect에는
 * false를 반환한다.
 *
 * @param circle rect 포함 여부를 판정할 circle
 * @param rect circle 안에 포함되는지 확인할 rect
 */
export function containsRect(circle: CircleLike, rect: RectLike): boolean {
  const rectX = readRectX(rect);
  const rectY = readRectY(rect);
  const rectWidth = readRectWidth(rect);
  const rectHeight = readRectHeight(rect);
  // empty rect → true (rect 정책 일치)
  if (rectWidth <= 0 || rectHeight <= 0) return true;
  // empty circle + non-empty rect → false
  if (readCircleRadius(circle) <= 0) return false;

  const cx = readX(readCircleCenter(circle));
  const cy = readY(readCircleCenter(circle));
  const r2 = readCircleRadius(circle) * readCircleRadius(circle);
  const x1 = rectX;
  const y1 = rectY;
  const x2 = rectX + rectWidth;
  const y2 = rectY + rectHeight;

  // 4 corner 모두 distanceSq <= r² 이어야 한다. sqrt 호출 회피.
  const dxL = x1 - cx;
  const dxR = x2 - cx;
  const dyT = y1 - cy;
  const dyB = y2 - cy;

  return (
    dxL * dxL + dyT * dyT <= r2 &&
    dxR * dxR + dyT * dyT <= r2 &&
    dxL * dxL + dyB * dyB <= r2 &&
    dxR * dxR + dyB * dyB <= r2
  );
}
