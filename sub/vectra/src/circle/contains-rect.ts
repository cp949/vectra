import type { Circle, Rect } from '../types/flat-shapes.internal';

/**
 * rect의 네 corner가 모두 circle 내부나 boundary 위에 있으면 true를 반환한다.
 *
 * empty rect는 true를 반환한다. empty circle은 empty rect일 때만 true가 되며, non-empty rect에는
 * false를 반환한다.
 *
 * @param circle rect 포함 여부를 판정할 circle
 * @param rect circle 안에 포함되는지 확인할 rect
 */
export function containsRect(circle: Circle, rect: Rect): boolean {
  const rectX = rect.x;
  const rectY = rect.y;
  const rectWidth = rect.width;
  const rectHeight = rect.height;
  // empty rect → true (rect 정책 일치)
  if (rectWidth <= 0 || rectHeight <= 0) return true;
  // empty circle + non-empty rect → false
  const r = circle.r;
  if (r <= 0) return false;

  const cx = circle.cx;
  const cy = circle.cy;
  const r2 = r * r;
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
