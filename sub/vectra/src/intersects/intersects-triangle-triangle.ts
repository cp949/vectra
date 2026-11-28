import { hasSeparatingEdgeNormal } from '../internal/convex-separating-axis';
import { hasNonFiniteTriangleVertex, flatTriangleSignedArea2x } from '../internal/triangle';
import type { Triangle } from '../types/flat-shapes.internal';

/**
 * 두 triangle이 교차하면 true를 반환한다.
 *
 * SAT (Separating Axis Theorem)으로 판정한다. 6개 법선 축 (각 triangle의 변 법선)을 모두 검사한다.
 * 한 축에서 두 triangle의 투영 구간이 분리되면 false를 반환한다.
 * 축 검사는 internal/convex-separating-axis의 hasSeparatingEdgeNormal을 a 기준, b 기준 순서로 호출한다.
 * degenerate triangle (세 꼭짓점이 collinear, signed area 2× === 0): false.
 * non-finite vertex를 가진 triangle: false.
 * 끝점 공유나 edge 접촉도 true.
 *
 * @param a 첫 번째 triangle
 * @param b 두 번째 triangle
 */
export function intersectsTriangleTriangle(a: Triangle, b: Triangle): boolean {
  if (hasNonFiniteTriangleVertex(a) || flatTriangleSignedArea2x(a) === 0) return false;
  if (hasNonFiniteTriangleVertex(b) || flatTriangleSignedArea2x(b) === 0) return false;

  const { x1: ax1, y1: ay1, x2: bx1, y2: by1, x3: cx1, y3: cy1 } = a;
  const { x1: ax2, y1: ay2, x2: bx2, y2: by2, x3: cx2, y3: cy2 } = b;
  const aVerts = [ax1, ay1, bx1, by1, cx1, cy1];
  const bVerts = [ax2, ay2, bx2, by2, cx2, cy2];

  return !hasSeparatingEdgeNormal(aVerts, bVerts) && !hasSeparatingEdgeNormal(bVerts, aVerts);
}
