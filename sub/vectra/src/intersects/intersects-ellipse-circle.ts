import { ellipseClosestPointAngle } from '../ellipse/ellipse-closest-point.internal';
import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readX, readY } from '../internal/xy';
import type { CircleLike, EllipseLike } from '../types';

/**
 * ellipse와 circle이 교차하거나 접하면 true를 반환한다.
 *
 * degenerate ellipse (rx ≤ 0 또는 ry ≤ 0): false.
 * degenerate circle (r ≤ 0): false.
 * closed boundary 포함 (접점도 true).
 *
 * @param ellipse 교차를 검사할 ellipse
 * @param circle 교차를 검사할 circle
 */
export function intersectsEllipseCircle(ellipse: EllipseLike, circle: CircleLike): boolean {
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);
  const r = readCircleRadius(circle);
  if (rx <= 0 || ry <= 0 || r <= 0) return false;

  const ecenter = readEllipseCenter(ellipse);
  const ecx = readX(ecenter);
  const ecy = readY(ecenter);
  const ccenter = readCircleCenter(circle);
  const ccx = readX(ccenter);
  const ccy = readY(ccenter);

  if (ecx + rx < ccx - r || ccx + r < ecx - rx || ecy + ry < ccy - r || ccy + r < ecy - ry) return false;

  const nx = (ccx - ecx) / rx;
  const ny = (ccy - ecy) / ry;
  if (nx * nx + ny * ny <= 1) return true;

  const dx = ecx - ccx;
  const dy = ecy - ccy;
  if (dx * dx + dy * dy <= r * r) return true;

  const theta = ellipseClosestPointAngle(ccx - ecx, ccy - ecy, rx, ry, 1e-10);
  const bx = ecx + Math.cos(theta) * rx;
  const by = ecy + Math.sin(theta) * ry;
  const bdx = ccx - bx;
  const bdy = ccy - by;
  return bdx * bdx + bdy * bdy <= r * r;
}
