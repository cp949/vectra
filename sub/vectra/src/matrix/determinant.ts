import type { Matrix } from '../types/flat-shapes.internal';

/**
 * matrix의 2D affine determinant를 반환한다.
 *
 * determinant는 a * d - b * c로 계산하며 translation component는 사용하지 않는다.
 *
 * @param matrix determinant를 계산할 matrix
 */
export function determinant(matrix: Matrix): number {
  return matrix.a * matrix.d - matrix.b * matrix.c;
}
