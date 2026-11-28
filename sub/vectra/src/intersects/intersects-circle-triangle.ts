import { hasNonFiniteTriangleVertex, flatTriangleSignedArea2x } from '../internal/triangle';
import type { Circle, Triangle } from '../types/flat-shapes.internal';

/**
 * circle과 triangle이 교차하거나 접하면 true를 반환한다.
 *
 * circle center가 triangle 내부이면 true.
 * triangle 각 변과 circle의 교차를 추가로 판정한다.
 * degenerate triangle (면적 0, non-finite 꼭짓점): false.
 * r ≤ 0인 circle: false.
 * closed boundary 포함 (접점도 true).
 *
 * @param circle 교차를 판정할 circle
 * @param triangle 교차를 판정할 triangle
 */
export function intersectsCircleTriangle(circle: Circle, triangle: Triangle): boolean {
  if (hasNonFiniteTriangleVertex(triangle) || flatTriangleSignedArea2x(triangle) === 0) return false;

  const r = circle.r;
  if (r <= 0) return false;

  const r2 = r * r;
  const cx = circle.cx;
  const cy = circle.cy;
  const { x1: ax, y1: ay, x2: bx, y2: by, x3: tcx, y3: tcy } = triangle;
  const sign = flatTriangleSignedArea2x(triangle) > 0 ? 1 : -1;

  const d0 = sign * ((bx - ax) * (cy - ay) - (by - ay) * (cx - ax));
  const d1 = sign * ((tcx - bx) * (cy - by) - (tcy - by) * (cx - bx));
  const d2 = sign * ((ax - tcx) * (cy - tcy) - (ay - tcy) * (cx - tcx));
  if (d0 >= 0 && d1 >= 0 && d2 >= 0) return true;

  const edges: [number, number, number, number][] = [
    [ax, ay, bx, by],
    [bx, by, tcx, tcy],
    [tcx, tcy, ax, ay],
  ];

  for (const [ex, ey, fx, fy] of edges) {
    const edgeDx = fx - ex;
    const edgeDy = fy - ey;
    const lenSq = edgeDx * edgeDx + edgeDy * edgeDy;
    let t = 0;
    if (lenSq > 0) t = Math.max(0, Math.min(1, ((cx - ex) * edgeDx + (cy - ey) * edgeDy) / lenSq));
    const nearX = ex + t * edgeDx;
    const nearY = ey + t * edgeDy;
    const dx = cx - nearX;
    const dy = cy - nearY;
    if (dx * dx + dy * dy <= r2) return true;
  }

  return false;
}
