import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { boundsContainsPointXY, polygonContainsPoint, readPolygonPoints, segmentsIntersect } from '../internal/polygon';
import { readX, readY } from '../internal/xy';
import type { BoundsLike, PolygonLike } from '../types';

/**
 * polygon과 bounds가 교차하면 true를 반환한다.
 *
 * - 판정 조건 (OR):
 *   1. bounds 꼭짓점이 polygon 내부(경계 포함)에 있다.
 *   2. polygon 꼭짓점이 bounds 내부(경계 포함)에 있다.
 *   3. polygon edge와 bounds edge가 교차한다.
 * - collinear 꼭짓점, self-intersecting polygon도 동일한 규칙으로 판정한다.
 * - inverted bounds (min > max): false.
 * - empty polygon (points.length < 3): false.
 *
 * @param polygon polygon 꼭짓점 목록
 * @param bounds  교차를 검사할 bounds
 */
export function intersectsPolygonBounds(polygon: PolygonLike, bounds: BoundsLike): boolean {
  const pts = readPolygonPoints(polygon);
  if (pts.length < 3) return false;

  const minX = readX(readBoundsMin(bounds));
  const minY = readY(readBoundsMin(bounds));
  const maxX = readX(readBoundsMax(bounds));
  const maxY = readY(readBoundsMax(bounds));
  if (maxX < minX || maxY < minY) return false;

  if (polygonContainsPoint(pts, minX, minY, 0)) return true;
  if (polygonContainsPoint(pts, maxX, minY, 0)) return true;
  if (polygonContainsPoint(pts, maxX, maxY, 0)) return true;
  if (polygonContainsPoint(pts, minX, maxY, 0)) return true;

  const n = pts.length;
  for (let i = 0; i < n; i++) {
    if (boundsContainsPointXY(minX, minY, maxX, maxY, readX(pts[i]), readY(pts[i]))) return true;
  }

  const boundsEdges: [number, number, number, number][] = [
    [minX, minY, maxX, minY],
    [maxX, minY, maxX, maxY],
    [maxX, maxY, minX, maxY],
    [minX, maxY, minX, minY],
  ];

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const eax = readX(pts[i]);
    const eay = readY(pts[i]);
    const ebx = readX(pts[j]);
    const eby = readY(pts[j]);
    for (const [cax, cay, cbx, cby] of boundsEdges) {
      if (segmentsIntersect(eax, eay, ebx, eby, cax, cay, cbx, cby)) return true;
    }
  }

  return false;
}
