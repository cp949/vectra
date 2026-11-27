import type { Matrix } from '../types/flat-shapes.internal';

/**
 * matrix의 determinant 절댓값이 epsilon보다 크면 true를 반환한다.
 *
 * epsilon 기본값은 0이므로 기본 호출은 determinant !== 0 판정이다.
 *
 * @param matrix invertible 여부를 확인할 matrix
 * @param epsilon singular로 볼 determinant 절대값 한계
 */
export function isInvertible(matrix: Matrix, epsilon = 0): boolean {
  return Math.abs(matrix.a * matrix.d - matrix.b * matrix.c) > epsilon;
}
