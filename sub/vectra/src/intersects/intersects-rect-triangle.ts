import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { hasNonFiniteVertex, readTriangleRawCoords, triangleSignedArea2x } from '../internal/triangle';
import type { RectLike, TriangleLike } from '../types';

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
export function intersectsRectTriangle(rect: RectLike, triangle: TriangleLike): boolean {
  if (hasNonFiniteVertex(triangle) || triangleSignedArea2x(triangle) === 0) return false;

  const rw = readRectWidth(rect);
  const rh = readRectHeight(rect);
  if (rw <= 0 || rh <= 0) return false;

  const rx = readRectX(rect);
  const ry = readRectY(rect);
  const rx2 = rx + rw;
  const ry2 = ry + rh;
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  const rectVerts: [number, number][] = [
    [rx, ry],
    [rx2, ry],
    [rx2, ry2],
    [rx, ry2],
  ];
  const triVerts: [number, number][] = [
    [ax, ay],
    [bx, by],
    [cx, cy],
  ];

  const triMinX = Math.min(ax, bx, cx);
  const triMaxX = Math.max(ax, bx, cx);
  if (triMaxX < rx || rx2 < triMinX) return false;
  const triMinY = Math.min(ay, by, cy);
  const triMaxY = Math.max(ay, by, cy);
  if (triMaxY < ry || ry2 < triMinY) return false;

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
    let minRect = Infinity;
    let maxRect = -Infinity;
    for (const [vx, vy] of rectVerts) {
      const p = vx * nx + vy * ny;
      if (p < minRect) minRect = p;
      if (p > maxRect) maxRect = p;
    }
    if (maxTri < minRect || maxRect < minTri) return false;
  }

  return true;
}
