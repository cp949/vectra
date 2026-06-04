import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { hasNonFiniteVertex, readTriangleRawCoords, triangleSignedArea2x } from '../internal/triangle';
import { readX, readY } from '../internal/xy';
import type { BoundsLike, TriangleLike } from '../types';

/**
 * bounds와 triangle이 교차하거나 접하면 true를 반환한다.
 *
 * SAT(Separating Axis Theorem)로 판정한다.
 * degenerate triangle (면적 0, non-finite 꼭짓점): false.
 * inverted bounds (min > max): false.
 * closed boundary 포함 (접점도 true).
 *
 * @param bounds 교차를 판정할 bounds
 * @param triangle 교차를 판정할 triangle
 */
export function intersectsBoundsTriangle(bounds: BoundsLike, triangle: TriangleLike): boolean {
  if (hasNonFiniteVertex(triangle) || triangleSignedArea2x(triangle) === 0) return false;

  const min = readBoundsMin(bounds);
  const max = readBoundsMax(bounds);
  const minX = readX(min);
  const minY = readY(min);
  const maxX = readX(max);
  const maxY = readY(max);
  if (maxX < minX || maxY < minY) return false;

  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  const boundsVerts: [number, number][] = [
    [minX, minY],
    [maxX, minY],
    [maxX, maxY],
    [minX, maxY],
  ];
  const triVerts: [number, number][] = [
    [ax, ay],
    [bx, by],
    [cx, cy],
  ];

  const triMinX = Math.min(ax, bx, cx);
  const triMaxX = Math.max(ax, bx, cx);
  if (triMaxX < minX || maxX < triMinX) return false;
  const triMinY = Math.min(ay, by, cy);
  const triMaxY = Math.max(ay, by, cy);
  if (triMaxY < minY || maxY < triMinY) return false;

  const triEdges: [number, number][] = [
    [-(by - ay), bx - ax],
    [-(cy - by), cx - bx],
    [-(ay - cy), ax - cx],
  ];

  for (const [nx, ny] of triEdges) {
    let minTri = Infinity;
    let maxTri = -Infinity;
    for (const [vx, vy] of triVerts) {
      const p = vx * nx + vy * ny;
      if (p < minTri) minTri = p;
      if (p > maxTri) maxTri = p;
    }
    let minBounds = Infinity;
    let maxBounds = -Infinity;
    for (const [vx, vy] of boundsVerts) {
      const p = vx * nx + vy * ny;
      if (p < minBounds) minBounds = p;
      if (p > maxBounds) maxBounds = p;
    }
    if (maxTri < minBounds || maxBounds < minTri) return false;
  }

  return true;
}
