import { hasNonFiniteVertex, readTriangleRawCoords, triangleSignedArea2x } from '../internal/triangle';
import type { TriangleLike } from '../types';

/**
 * 두 triangle이 교차하면 true를 반환한다.
 *
 * SAT (Separating Axis Theorem)으로 판정한다. 6개 법선 축 (각 triangle의 변 법선)을 모두 검사한다.
 * 한 축에서 두 triangle의 투영 구간이 분리되면 false를 반환한다.
 * degenerate triangle (세 꼭짓점이 collinear, signed area 2× === 0): false.
 * non-finite vertex를 가진 triangle: false.
 * 끝점 공유나 edge 접촉도 true.
 *
 * @param a 첫 번째 triangle
 * @param b 두 번째 triangle
 */
export function intersectsTriangleTriangle(a: TriangleLike, b: TriangleLike): boolean {
  if (hasNonFiniteVertex(a) || triangleSignedArea2x(a) === 0) return false;
  if (hasNonFiniteVertex(b) || triangleSignedArea2x(b) === 0) return false;

  const { ax: ax1, ay: ay1, bx: bx1, by: by1, cx: cx1, cy: cy1 } = readTriangleRawCoords(a);
  const { ax: ax2, ay: ay2, bx: bx2, by: by2, cx: cx2, cy: cy2 } = readTriangleRawCoords(b);
  const aVerts: [number, number][] = [
    [ax1, ay1],
    [bx1, by1],
    [cx1, cy1],
  ];
  const bVerts: [number, number][] = [
    [ax2, ay2],
    [bx2, by2],
    [cx2, cy2],
  ];
  const axes: [number, number][] = [
    [-(by1 - ay1), bx1 - ax1],
    [-(cy1 - by1), cx1 - bx1],
    [-(ay1 - cy1), ax1 - cx1],
    [-(by2 - ay2), bx2 - ax2],
    [-(cy2 - by2), cx2 - bx2],
    [-(ay2 - cy2), ax2 - cx2],
  ];

  for (const [nx, ny] of axes) {
    let minA = Infinity;
    let maxA = -Infinity;
    for (const [vx, vy] of aVerts) {
      const p = vx * nx + vy * ny;
      if (p < minA) minA = p;
      if (p > maxA) maxA = p;
    }
    let minB = Infinity;
    let maxB = -Infinity;
    for (const [vx, vy] of bVerts) {
      const p = vx * nx + vy * ny;
      if (p < minB) minB = p;
      if (p > maxB) maxB = p;
    }
    if (maxA < minB || maxB < minA) return false;
  }

  return true;
}
