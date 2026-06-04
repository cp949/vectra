import { readMatrixA, readMatrixB, readMatrixC, readMatrixD } from '../internal/matrix';
import type { MatrixLike } from '../types';

/**
 * matrix의 2D affine determinant를 반환한다.
 *
 * determinant는 a * d - b * c로 계산하며 translation component는 사용하지 않는다.
 *
 * @param matrix determinant를 계산할 matrix
 */
export function determinant(matrix: MatrixLike): number {
  return readMatrixA(matrix) * readMatrixD(matrix) - readMatrixB(matrix) * readMatrixC(matrix);
}
