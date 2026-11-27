import type { Matrix } from '../types/flat-shapes.internal';

/**
 * matrix가 identity matrix와 epsilon 이내로 같으면 true를 반환한다.
 *
 * epsilon 기본값은 0이므로 기본 호출은 exact identity 판정이다.
 *
 * @param matrix identity 여부를 확인할 matrix
 * @param epsilon 각 component에 적용할 절대 허용 오차
 */
export function isIdentity(matrix: Matrix, epsilon = 0): boolean {
  return (
    Math.abs(matrix.a - 1) <= epsilon &&
    Math.abs(matrix.b) <= epsilon &&
    Math.abs(matrix.c) <= epsilon &&
    Math.abs(matrix.d - 1) <= epsilon &&
    Math.abs(matrix.tx) <= epsilon &&
    Math.abs(matrix.ty) <= epsilon
  );
}
