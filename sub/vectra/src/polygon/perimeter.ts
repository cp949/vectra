import type { Polygon } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * polygon의 둘레를 반환한다.
 *
 * 모든 edge(마지막 point → 첫 point 닫음 포함)의 길이 합이다.
 * empty polygon(pointCount < 3)은 0을 반환한다.
 *
 * @param polygon 둘레를 계산할 polygon
 */
export function perimeter(polygon: Polygon): number {
  if (polygon.length < 6) return 0;
  let total = 0;
  const n = polygon.length / 2;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const dx = polygon[2 * j] - polygon[2 * i];
    const dy = polygon[2 * j + 1] - polygon[2 * i + 1];
    total += hypot2(dx, dy);
  }
  return total;
}
