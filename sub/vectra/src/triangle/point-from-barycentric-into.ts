import { readTriangleRawCoords } from '../internal/triangle';
import { writeXY } from '../internal/xy';
import type { BarycentricLike, TriangleLike, XYWritable } from '../types';

export type { BarycentricLike };

/**
 * barycentric 좌표를 Cartesian point로 변환해 out에 기록하고 out을 반환한다.
 *
 * u = barycentric.x (vertex A 가중치), v = barycentric.y (vertex B 가중치), w = barycentric.w (vertex C 가중치).
 * out.x = u*ax + v*bx + w*cx, out.y = u*ay + v*by + w*cy.
 *
 * u + v + w를 검사하거나 1로 normalize하지 않는다. weight가 음수거나 1을 넘어도 clamp하지 않으므로
 * triangle 바깥 point를 만들 수 있다. normalization과 clamp는 caller 책임이다.
 * degenerate triangle(collinear, 세 vertex가 같은 점 포함)도 affine combination이 정의되므로 실패하지 않는다.
 * non-finite(NaN, Infinity, -Infinity) 입력은 검증 없이 JS 산술 결과를 그대로 기록한다.
 *
 * aliasing: triangle 좌표와 barycentric component를 local에 먼저 읽으므로 out이 triangle.a /
 * triangle.b / triangle.c와 같은 storage여도 안전하다.
 *
 * @param out point 좌표를 기록할 writable output
 * @param triangle 기준 triangle
 * @param barycentric vertex A/B/C 가중치 (x = u, y = v, w = w)
 * @returns out
 */
export function pointFromBarycentricInto<Out extends XYWritable>(
  out: Out,
  triangle: TriangleLike,
  barycentric: BarycentricLike
): Out {
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  const u = barycentric.x;
  const v = barycentric.y;
  const w = barycentric.w;
  const px = u * ax + v * bx + w * cx;
  const py = u * ay + v * by + w * cy;
  return writeXY(out, px, py);
}
