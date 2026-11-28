import type { Matrix, MatrixWritable } from '../types/flat-shapes.internal';

/**
 * `left * right`를 `out`에 기록한다. matrix `Into` 함수의 공통 multiply 식.
 *
 * aliasing-safe: 모든 입력 component를 local 변수로 먼저 읽은 뒤 `out`에 기록하므로
 * `out === left`, `out === right`, `left === right` 모두 허용된다.
 *
 * @param out multiply 결과를 기록할 writable matrix
 * @param left 왼쪽에 곱할 matrix
 * @param right 오른쪽에 곱할 matrix
 */
export function matrixMultiplyInto<Out extends MatrixWritable>(out: Out, left: Matrix, right: Matrix): Out {
  const la = left.a;
  const lb = left.b;
  const lc = left.c;
  const ld = left.d;
  const ltx = left.tx;
  const lty = left.ty;
  const ra = right.a;
  const rb = right.b;
  const rc = right.c;
  const rd = right.d;
  const rtx = right.tx;
  const rty = right.ty;
  out.a = la * ra + lc * rb;
  out.b = lb * ra + ld * rb;
  out.c = la * rc + lc * rd;
  out.d = lb * rc + ld * rd;
  out.tx = la * rtx + lc * rty + ltx;
  out.ty = lb * rtx + ld * rty + lty;
  return out;
}
