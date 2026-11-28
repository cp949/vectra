import { hasSeparatingEdgeNormal } from '../internal/convex-separating-axis';
import { hasNonFiniteTriangleVertex, flatTriangleSignedArea2x } from '../internal/triangle';
import type { Rect, Triangle } from '../types/flat-shapes.internal';

/**
 * rect와 triangle이 교차하거나 접하면 true를 반환한다.
 *
 * SAT(Separating Axis Theorem)로 판정한다.
 * empty rect (width ≤ 0 또는 height ≤ 0): false.
 * degenerate triangle (면적 = 0 또는 non-finite vertex 포함): false.
 * closed boundary 포함 (접점도 true).
 *
 * @param rect 교차를 검사할 rect
 * @param triangle 교차를 검사할 triangle
 */
export function intersectsRectTriangle(rect: Rect, triangle: Triangle): boolean {
  if (hasNonFiniteTriangleVertex(triangle) || flatTriangleSignedArea2x(triangle) === 0) return false;

  const rw = rect.width;
  const rh = rect.height;
  if (rw <= 0 || rh <= 0) return false;

  const rx = rect.x;
  const ry = rect.y;
  const rx2 = rx + rw;
  const ry2 = ry + rh;
  const { x1: ax, y1: ay, x2: bx, y2: by, x3: cx, y3: cy } = triangle;

  const triMinX = Math.min(ax, bx, cx);
  const triMaxX = Math.max(ax, bx, cx);
  if (triMaxX < rx || rx2 < triMinX) return false;
  const triMinY = Math.min(ay, by, cy);
  const triMaxY = Math.max(ay, by, cy);
  if (triMaxY < ry || ry2 < triMinY) return false;

  const rectVerts = [rx, ry, rx2, ry, rx2, ry2, rx, ry2];
  const triVerts = [ax, ay, bx, by, cx, cy];

  return !hasSeparatingEdgeNormal(triVerts, rectVerts);
}
