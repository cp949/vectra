import type { Matrix } from '../types/flat-shapes.internal';

/**
 * matrix의 6개 component를 mutable 6-element tuple out에 기록하고 out을 반환한다.
 *
 * 기록 순서: `[a, b, c, d, tx, ty]`.
 * NaN/Infinity component는 검증 없이 pass through한다.
 *
 * @param out matrix component를 기록할 mutable 6-element tuple
 * @param matrix 읽을 matrix
 */
export function toArray6Into(
  out: [number, number, number, number, number, number],
  matrix: Matrix
): [number, number, number, number, number, number] {
  out[0] = matrix.a;
  out[1] = matrix.b;
  out[2] = matrix.c;
  out[3] = matrix.d;
  out[4] = matrix.tx;
  out[5] = matrix.ty;
  return out;
}
