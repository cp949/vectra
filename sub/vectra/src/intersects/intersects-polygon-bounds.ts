import { boundsContainsPointXY } from '../internal/bounds';
import { polygonContainsPoint, segmentsIntersect } from '../internal/polygon';
import type { Bounds, Polygon } from '../types/flat-shapes.internal';

/**
 * polygon과 bounds가 교차하면 true를 반환한다.
 *
 * - 판정 조건 (OR):
 *   1. bounds 꼭짓점이 polygon 내부(경계 포함)에 있다.
 *   2. polygon 꼭짓점이 bounds 내부(경계 포함)에 있다.
 *   3. polygon edge와 bounds edge가 교차한다.
 * - collinear 꼭짓점, self-intersecting polygon도 동일한 규칙으로 판정한다.
 * - inverted bounds (min > max): false.
 * - empty polygon (좌표 수 < 6): false.
 *
 * @param polygon x, y를 번갈아 담은 polygon 좌표 배열
 * @param bounds  교차를 검사할 bounds
 */
export function intersectsPolygonBounds(polygon: Polygon, bounds: Bounds): boolean {
  const pts = polygon;
  if (pts.length < 6) return false;

  const minX = bounds.minX;
  const minY = bounds.minY;
  const maxX = bounds.maxX;
  const maxY = bounds.maxY;
  if (maxX < minX || maxY < minY) return false;

  if (polygonContainsPoint(pts, minX, minY, 0)) return true;
  if (polygonContainsPoint(pts, maxX, minY, 0)) return true;
  if (polygonContainsPoint(pts, maxX, maxY, 0)) return true;
  if (polygonContainsPoint(pts, minX, maxY, 0)) return true;

  const n = pts.length;
  for (let i = 0; i < n; i += 2) {
    if (boundsContainsPointXY(minX, minY, maxX, maxY, pts[i], pts[i + 1])) return true;
  }

  const boundsEdges: [number, number, number, number][] = [
    [minX, minY, maxX, minY],
    [maxX, minY, maxX, maxY],
    [maxX, maxY, minX, maxY],
    [minX, maxY, minX, minY],
  ];

  for (let i = 0; i < n; i += 2) {
    const j = (i + 2) % n;
    const eax = pts[i];
    const eay = pts[i + 1];
    const ebx = pts[j];
    const eby = pts[j + 1];
    for (const [cax, cay, cbx, cby] of boundsEdges) {
      if (segmentsIntersect(eax, eay, ebx, eby, cax, cay, cbx, cby)) return true;
    }
  }

  return false;
}
