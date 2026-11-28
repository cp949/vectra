import { boxEdgesCrossEllipse } from '../ellipse/ellipse-arc-crossing.internal';
import type { Bounds, Ellipse } from '../types/flat-shapes.internal';

/**
 * ellipse와 bounds가 교차하거나 접하면 true를 반환한다.
 *
 * degenerate ellipse (rx ≤ 0 또는 ry ≤ 0): false.
 * inverted bounds (maxX < minX 또는 maxY < minY): false.
 * closed boundary 포함 (접점도 true).
 *
 * @param ellipse 교차를 검사할 ellipse
 * @param bounds 교차를 검사할 bounds
 */
export function intersectsEllipseBounds(ellipse: Ellipse, bounds: Bounds): boolean {
  const rx = ellipse.rx;
  const ry = ellipse.ry;
  if (rx <= 0 || ry <= 0) return false;

  const minX = bounds.minX;
  const minY = bounds.minY;
  const maxX = bounds.maxX;
  const maxY = bounds.maxY;
  if (maxX < minX || maxY < minY) return false;

  const cx = ellipse.cx;
  const cy = ellipse.cy;
  if (cx + rx < minX || maxX < cx - rx || cy + ry < minY || maxY < cy - ry) return false;
  if (minX <= cx && cx <= maxX && minY <= cy && cy <= maxY) return true;

  const corners: [number, number][] = [
    [minX, minY],
    [maxX, minY],
    [maxX, maxY],
    [minX, maxY],
  ];

  for (const [px, py] of corners) {
    const ndx = (cx - px) / rx;
    const ndy = (cy - py) / ry;
    if (ndx * ndx + ndy * ndy <= 1) return true;
  }

  return boxEdgesCrossEllipse(minX, minY, maxX, maxY, cx, cy, rx, ry);
}
