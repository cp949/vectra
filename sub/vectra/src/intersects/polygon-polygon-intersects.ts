import { DEFAULT_EPSILON } from '../internal/numeric';
import { polygonPolygonIntersects as polygonPolygonIntersectsKernel } from '../internal/polygon-relation';
import type { PolygonLike } from '../types';

/**
 * 두 polygon이 교차(영역 접촉/중첩)하면 true를 반환한다.
 *
 * lightweight area relation helper다. polygon clipping/union/intersection/difference, hole-aware
 * polygon, self-intersection repair는 제품 비범위다. 교점 collection이 아니라 boolean만 반환한다.
 * - 판정 조건 (OR):
 *   1. polygon A edge와 polygon B edge가 교차(endpoint touch, collinear overlap 포함)한다.
 *   2. polygon A가 polygon B 내부에 완전히 포함된다(A의 첫 vertex가 B 내부/boundary).
 *   3. polygon B가 polygon A 내부에 완전히 포함된다(B의 첫 vertex가 A 내부/boundary).
 * - empty polygon(points.length < 3)은 false다.
 * - self-intersecting polygon, collinear 꼭짓점도 같은 규칙으로 판정한다.
 *
 * `epsilon`은 containment/boundary 판정에만 쓰고 finite validation을 완화하지 않는다. edge crossing은
 * epsilon 없는 exact 검사다.
 *
 * @param a 첫 번째 polygon
 * @param b 두 번째 polygon
 * @param epsilon containment/boundary 판정 임계값
 */
export function polygonPolygonIntersects(a: PolygonLike, b: PolygonLike, epsilon = DEFAULT_EPSILON): boolean {
  return polygonPolygonIntersectsKernel(a, b, epsilon);
}
