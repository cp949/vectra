import type { MatrixLike, MatrixObjectLike, MatrixTuple } from '../types';
import type { Matrix, MatrixWritable } from '../types/flat-shapes.internal';

function isMatrixTuple(matrix: MatrixLike): matrix is MatrixTuple {
  return Array.isArray(matrix);
}

function readComponent(matrix: MatrixLike, index: 0 | 1 | 2 | 3 | 4 | 5, key: keyof MatrixObjectLike): number {
  return isMatrixTuple(matrix) ? matrix[index] : matrix[key];
}

/** matrix input의 a component를 읽는다. */
export function readMatrixA(matrix: MatrixLike): number {
  return readComponent(matrix, 0, 'a');
}

/** matrix input의 b component를 읽는다. */
export function readMatrixB(matrix: MatrixLike): number {
  return readComponent(matrix, 1, 'b');
}

/** matrix input의 c component를 읽는다. */
export function readMatrixC(matrix: MatrixLike): number {
  return readComponent(matrix, 2, 'c');
}

/** matrix input의 d component를 읽는다. */
export function readMatrixD(matrix: MatrixLike): number {
  return readComponent(matrix, 3, 'd');
}

/** matrix input의 tx component를 읽는다. */
export function readMatrixTx(matrix: MatrixLike): number {
  return readComponent(matrix, 4, 'tx');
}

/** matrix input의 ty component를 읽는다. */
export function readMatrixTy(matrix: MatrixLike): number {
  return readComponent(matrix, 5, 'ty');
}

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
