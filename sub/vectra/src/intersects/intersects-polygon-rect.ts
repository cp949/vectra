import { polygonContainsPoint, segmentsIntersect } from '../internal/polygon';
import { rectContainsPointXY } from '../internal/rect';
import type { Polygon, Rect } from '../types/flat-shapes.internal';

/**
 * polygon과 rect가 교차하면 true를 반환한다.
 *
 * - 판정 조건 (OR):
 *   1. rect 꼭짓점이 polygon 내부(경계 포함)에 있다.
 *   2. polygon 꼭짓점이 rect 내부(경계 포함)에 있다.
 *   3. polygon edge와 rect edge가 교차한다.
 * - collinear 꼭짓점, self-intersecting polygon도 동일한 규칙으로 판정한다.
 * - empty rect (width ≤ 0 또는 height ≤ 0): false.
 * - empty polygon (좌표 수 < 6): false.
 *
 * @param polygon 교차를 검사할 polygon
 * @param rect    교차를 검사할 rect
 */
export function intersectsPolygonRect(polygon: Polygon, rect: Rect): boolean {
  const pts = polygon;
  if (pts.length < 6) return false;

  const rx = rect.x;
  const ry = rect.y;
  const rw = rect.width;
  const rh = rect.height;
  if (rw <= 0 || rh <= 0) return false;

  const rx2 = rx + rw;
  const ry2 = ry + rh;
  if (polygonContainsPoint(pts, rx, ry, 0)) return true;
  if (polygonContainsPoint(pts, rx2, ry, 0)) return true;
  if (polygonContainsPoint(pts, rx2, ry2, 0)) return true;
  if (polygonContainsPoint(pts, rx, ry2, 0)) return true;

  const n = pts.length;
  for (let i = 0; i < n; i += 2) {
    if (rectContainsPointXY(rx, ry, rw, rh, pts[i], pts[i + 1])) return true;
  }

  const rectEdges: [number, number, number, number][] = [
    [rx, ry, rx2, ry],
    [rx2, ry, rx2, ry2],
    [rx2, ry2, rx, ry2],
    [rx, ry2, rx, ry],
  ];

  for (let i = 0; i < n; i += 2) {
    const j = (i + 2) % n;
    const eax = pts[i];
    const eay = pts[i + 1];
    const ebx = pts[j];
    const eby = pts[j + 1];
    for (const [cax, cay, cbx, cby] of rectEdges) {
      if (segmentsIntersect(eax, eay, ebx, eby, cax, cay, cbx, cby)) return true;
    }
  }

  return false;
}
