import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { readX, readY } from '../internal/xy';
import type { EllipseLike, RectLike } from '../types';
import { pointInEllipseClosed } from './ellipse-contains.internal';

/**
 * rect의 네 corner가 모두 ellipse 내부 또는 closed boundary 위에 있으면 true를 반환한다.
 *
 * empty rect(`width <= 0 || height <= 0`)는 true를 반환한다. circle `containsRect`와 같은 정책이다.
 * empty ellipse(`radiusX <= 0 || radiusY <= 0`)는 empty rect일 때만 true이고 non-empty rect에는 false다.
 *
 * @param ellipse rect 포함 여부를 판정할 ellipse
 * @param rect ellipse 안에 포함되는지 확인할 rect
 */
export function containsRect(ellipse: EllipseLike, rect: RectLike): boolean {
  const w = readRectWidth(rect);
  const h = readRectHeight(rect);
  // empty rect → true (rect 정책 일치)
  if (w <= 0 || h <= 0) return true;
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);
  // empty ellipse + non-empty rect → false
  if (rx <= 0 || ry <= 0) return false;

  const cx = readX(readEllipseCenter(ellipse));
  const cy = readY(readEllipseCenter(ellipse));
  const x1 = readRectX(rect);
  const y1 = readRectY(rect);
  const x2 = x1 + w;
  const y2 = y1 + h;

  return (
    pointInEllipseClosed(cx, cy, rx, ry, x1, y1) &&
    pointInEllipseClosed(cx, cy, rx, ry, x2, y1) &&
    pointInEllipseClosed(cx, cy, rx, ry, x1, y2) &&
    pointInEllipseClosed(cx, cy, rx, ry, x2, y2)
  );
}
