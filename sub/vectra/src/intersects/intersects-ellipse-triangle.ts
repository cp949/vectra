import { segmentCrossesEllipse } from '../ellipse/ellipse-arc-crossing.internal';
import { hasNonFiniteTriangleVertex, flatTriangleSignedArea2x } from '../internal/triangle';
import type { Ellipse, Triangle } from '../types/flat-shapes.internal';

/**
 * ellipse와 triangle이 교차하거나 접하면 true를 반환한다.
 *
 * degenerate ellipse (rx ≤ 0 또는 ry ≤ 0): false.
 * degenerate triangle (면적 = 0 또는 non-finite vertex 포함): false.
 * closed boundary 포함 (접점도 true).
 *
 * @param ellipse 교차를 검사할 ellipse
 * @param triangle 교차를 검사할 triangle
 */
export function intersectsEllipseTriangle(ellipse: Ellipse, triangle: Triangle): boolean {
  const rx = ellipse.rx;
  const ry = ellipse.ry;
  if (rx <= 0 || ry <= 0) return false;
  if (hasNonFiniteTriangleVertex(triangle)) return false;

  const area2x = flatTriangleSignedArea2x(triangle);
  if (area2x === 0) return false;

  const ecx = ellipse.cx;
  const ecy = ellipse.cy;
  const { x1: ax, y1: ay, x2: bx, y2: by, x3: tcx, y3: tcy } = triangle;

  const sign = area2x > 0 ? 1 : -1;
  const d0 = sign * ((bx - ax) * (ecy - ay) - (by - ay) * (ecx - ax));
  const d1 = sign * ((tcx - bx) * (ecy - by) - (tcy - by) * (ecx - bx));
  const d2 = sign * ((ax - tcx) * (ecy - tcy) - (ay - tcy) * (ecx - tcx));
  if (d0 >= 0 && d1 >= 0 && d2 >= 0) return true;

  const vax = (ax - ecx) / rx;
  const vay = (ay - ecy) / ry;
  if (vax * vax + vay * vay <= 1) return true;
  const vbx = (bx - ecx) / rx;
  const vby = (by - ecy) / ry;
  if (vbx * vbx + vby * vby <= 1) return true;
  const vcx = (tcx - ecx) / rx;
  const vcy = (tcy - ecy) / ry;
  if (vcx * vcx + vcy * vcy <= 1) return true;

  if (segmentCrossesEllipse(ax, ay, bx, by, ecx, ecy, rx, ry)) return true;
  if (segmentCrossesEllipse(bx, by, tcx, tcy, ecx, ecy, rx, ry)) return true;
  return segmentCrossesEllipse(tcx, tcy, ax, ay, ecx, ecy, rx, ry);
}
