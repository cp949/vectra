import { hasSeparatingEdgeNormal } from '../internal/convex-separating-axis';
import { hasNonFiniteTriangleVertex, flatTriangleSignedArea2x } from '../internal/triangle';
import type { Bounds, Triangle } from '../types/flat-shapes.internal';

/**
 * bounds와 triangle이 교차하거나 접하면 true를 반환한다.
 *
 * SAT(Separating Axis Theorem)로 판정한다.
 * degenerate triangle (면적 0, non-finite 꼭짓점): false.
 * inverted bounds (minX > maxX 또는 minY > maxY): false.
 * closed boundary 포함 (접점도 true).
 *
 * @param bounds 교차를 판정할 bounds
 * @param triangle 교차를 판정할 triangle
 */
export function intersectsBoundsTriangle(bounds: Bounds, triangle: Triangle): boolean {
  if (hasNonFiniteTriangleVertex(triangle) || flatTriangleSignedArea2x(triangle) === 0) return false;

  const { minX, minY, maxX, maxY } = bounds;
  if (maxX < minX || maxY < minY) return false;

  const { x1: ax, y1: ay, x2: bx, y2: by, x3: cx, y3: cy } = triangle;

  const triMinX = Math.min(ax, bx, cx);
  const triMaxX = Math.max(ax, bx, cx);
  if (triMaxX < minX || maxX < triMinX) return false;
  const triMinY = Math.min(ay, by, cy);
  const triMaxY = Math.max(ay, by, cy);
  if (triMaxY < minY || maxY < triMinY) return false;

  const boundsVerts = [minX, minY, maxX, minY, maxX, maxY, minX, maxY];
  const triVerts = [ax, ay, bx, by, cx, cy];

  return !hasSeparatingEdgeNormal(triVerts, boundsVerts);
}
