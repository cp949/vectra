import { boxEdgesCrossEllipse } from '../ellipse/ellipse-arc-crossing.internal';
import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readX, readY } from '../internal/xy';
import type { BoundsLike, EllipseLike } from '../types';

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
export function intersectsEllipseBounds(ellipse: EllipseLike, bounds: BoundsLike): boolean {
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);
  if (rx <= 0 || ry <= 0) return false;

  const min = readBoundsMin(bounds);
  const max = readBoundsMax(bounds);
  const minX = readX(min);
  const minY = readY(min);
  const maxX = readX(max);
  const maxY = readY(max);
  if (maxX < minX || maxY < minY) return false;

  const cx = readX(readEllipseCenter(ellipse));
  const cy = readY(readEllipseCenter(ellipse));
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
