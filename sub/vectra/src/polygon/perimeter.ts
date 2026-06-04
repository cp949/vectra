import { readPolygonPoints } from '../internal/polygon';
import { readX, readY } from '../internal/xy';
import type { PolygonLike } from '../types';

/**
 * polygon의 둘레를 반환한다.
 *
 * 모든 edge(마지막 point → 첫 point 닫음 포함)의 길이 합이다.
 * empty polygon(pointCount < 3)은 0을 반환한다.
 *
 * @param polygon 둘레를 계산할 polygon
 */
export function perimeter(polygon: PolygonLike): number {
  const pts = readPolygonPoints(polygon);
  if (pts.length < 3) return 0;
  let total = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const dx = readX(pts[j]) - readX(pts[i]);
    const dy = readY(pts[j]) - readY(pts[i]);
    total += Math.hypot(dx, dy);
  }
  return total;
}
