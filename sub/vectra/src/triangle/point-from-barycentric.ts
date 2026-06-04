import type { BarycentricLike, TriangleLike, XYObjectWritable } from '../types';
import { pointFromBarycentricInto } from './point-from-barycentric-into';

/**
 * pointFromBarycentricInto의 allocating companion.
 * barycentric 좌표를 Cartesian point로 변환해 새 XYObjectWritable로 반환한다.
 *
 * u = barycentric.x (vertex A 가중치), v = barycentric.y (vertex B 가중치), w = barycentric.w (vertex C 가중치).
 * x = u*ax + v*bx + w*cx, y = u*ay + v*by + w*cy.
 *
 * u + v + w를 검사하거나 1로 normalize하지 않는다. weight가 음수거나 1을 넘어도 clamp하지 않으므로
 * triangle 바깥 point를 만들 수 있다. normalization과 clamp는 caller 책임이다.
 * degenerate triangle(collinear, 세 vertex가 같은 점 포함)도 affine combination이 정의되므로 실패하지 않는다.
 * non-finite(NaN, Infinity, -Infinity) 입력은 검증 없이 JS 산술 결과를 그대로 반환한다.
 *
 * @param triangle 기준 triangle
 * @param barycentric vertex A/B/C 가중치 (x = u, y = v, w = w)
 */
export function pointFromBarycentric(triangle: TriangleLike, barycentric: BarycentricLike): XYObjectWritable {
  const seed: XYObjectWritable = { x: 0, y: 0 };
  return pointFromBarycentricInto(seed, triangle, barycentric);
}
