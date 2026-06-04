import { polygonContainsPoint, readPolygonPoints, rectContainsPointXY, segmentsIntersect } from '../internal/polygon';
import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { readX, readY } from '../internal/xy';
import type { PolygonLike, RectLike } from '../types';

/**
 * polygon과 rect가 교차하면 true를 반환한다.
 *
 * - 판정 조건 (OR):
 *   1. rect 꼭짓점이 polygon 내부(경계 포함)에 있다.
 *   2. polygon 꼭짓점이 rect 내부(경계 포함)에 있다.
 *   3. polygon edge와 rect edge가 교차한다.
 * - collinear 꼭짓점, self-intersecting polygon도 동일한 규칙으로 판정한다.
 * - empty rect (width ≤ 0 또는 height ≤ 0): false.
 * - empty polygon (points.length < 3): false.
 *
 * @param polygon 교차를 검사할 polygon
 * @param rect    교차를 검사할 rect
 */
export function intersectsPolygonRect(polygon: PolygonLike, rect: RectLike): boolean {
  const pts = readPolygonPoints(polygon);
  if (pts.length < 3) return false;

  const rx = readRectX(rect);
  const ry = readRectY(rect);
  const rw = readRectWidth(rect);
  const rh = readRectHeight(rect);
  if (rw <= 0 || rh <= 0) return false;

  const rx2 = rx + rw;
  const ry2 = ry + rh;
  if (polygonContainsPoint(pts, rx, ry, 0)) return true;
  if (polygonContainsPoint(pts, rx2, ry, 0)) return true;
  if (polygonContainsPoint(pts, rx2, ry2, 0)) return true;
  if (polygonContainsPoint(pts, rx, ry2, 0)) return true;

  const n = pts.length;
  for (let i = 0; i < n; i++) {
    if (rectContainsPointXY(rx, ry, rw, rh, readX(pts[i]), readY(pts[i]))) return true;
  }

  const rectEdges: [number, number, number, number][] = [
    [rx, ry, rx2, ry],
    [rx2, ry, rx2, ry2],
    [rx2, ry2, rx, ry2],
    [rx, ry2, rx, ry],
  ];

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const eax = readX(pts[i]);
    const eay = readY(pts[i]);
    const ebx = readX(pts[j]);
    const eby = readY(pts[j]);
    for (const [cax, cay, cbx, cby] of rectEdges) {
      if (segmentsIntersect(eax, eay, ebx, eby, cax, cay, cbx, cby)) return true;
    }
  }

  return false;
}
