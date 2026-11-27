import type { Matrix } from '../types/flat-shapes.internal';

/**
 * matrix의 6개 component를 column-major mutable 9-element tuple out에 기록하고 out을 반환한다.
 *
 * column-major 순서: `[a, b, 0, c, d, 0, tx, ty, 1]`.
 * 2D affine 마지막 행은 `[0, 0, 1]`로 고정 기록된다 (index 2=0, index 5=0, index 8=1).
 * NaN/Infinity component는 검증 없이 pass through한다.
 *
 * @param out matrix component를 기록할 mutable 9-element tuple
 * @param matrix 읽을 matrix
 */
export function toArray9Into(
  out: [number, number, number, number, number, number, number, number, number],
  matrix: Matrix
): [number, number, number, number, number, number, number, number, number] {
  out[0] = matrix.a;
  out[1] = matrix.b;
  out[2] = 0;
  out[3] = matrix.c;
  out[4] = matrix.d;
  out[5] = 0;
  out[6] = matrix.tx;
  out[7] = matrix.ty;
  out[8] = 1;
  return out;
}
