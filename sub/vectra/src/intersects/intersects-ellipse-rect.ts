import { boxEdgesCrossEllipse } from '../ellipse/ellipse-arc-crossing.internal';
import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { readX, readY } from '../internal/xy';
import type { EllipseLike, RectLike } from '../types';

/**
 * ellipse와 rect가 교차하거나 접하면 true를 반환한다.
 *
 * degenerate ellipse (rx ≤ 0 또는 ry ≤ 0): false.
 * empty rect (width ≤ 0 또는 height ≤ 0): false.
 * closed boundary 포함 (접점도 true).
 *
 * @param ellipse 교차를 검사할 ellipse
 * @param rect 교차를 검사할 rect
 */
export function intersectsEllipseRect(ellipse: EllipseLike, rect: RectLike): boolean {
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);
  if (rx <= 0 || ry <= 0) return false;

  const rw = readRectWidth(rect);
  const rh = readRectHeight(rect);
  if (rw <= 0 || rh <= 0) return false;

  const cx = readX(readEllipseCenter(ellipse));
  const cy = readY(readEllipseCenter(ellipse));
  const rectX = readRectX(rect);
  const rectY = readRectY(rect);
  const rectX2 = rectX + rw;
  const rectY2 = rectY + rh;

  if (cx + rx < rectX || rectX2 < cx - rx || cy + ry < rectY || rectY2 < cy - ry) return false;
  if (rectX <= cx && cx <= rectX2 && rectY <= cy && cy <= rectY2) return true;

  const corners: [number, number][] = [
    [rectX, rectY],
    [rectX2, rectY],
    [rectX2, rectY2],
    [rectX, rectY2],
  ];

  for (const [px, py] of corners) {
    const ndx = (cx - px) / rx;
    const ndy = (cy - py) / ry;
    if (ndx * ndx + ndy * ndy <= 1) return true;
  }

  return boxEdgesCrossEllipse(rectX, rectY, rectX2, rectY2, cx, cy, rx, ry);
}
