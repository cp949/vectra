import { readMatrixA, readMatrixB, readMatrixC, readMatrixD, readMatrixTx, readMatrixTy } from '../internal/matrix';
import type { MatrixLike } from '../types';

/**
 * matrix가 identity matrix와 epsilon 이내로 같으면 true를 반환한다.
 *
 * epsilon 기본값은 0이므로 기본 호출은 exact identity 판정이다.
 *
 * @param matrix identity 여부를 확인할 matrix
 * @param epsilon 각 component에 적용할 절대 허용 오차
 */
export function isIdentity(matrix: MatrixLike, epsilon = 0): boolean {
  return (
    Math.abs(readMatrixA(matrix) - 1) <= epsilon &&
    Math.abs(readMatrixB(matrix)) <= epsilon &&
    Math.abs(readMatrixC(matrix)) <= epsilon &&
    Math.abs(readMatrixD(matrix) - 1) <= epsilon &&
    Math.abs(readMatrixTx(matrix)) <= epsilon &&
    Math.abs(readMatrixTy(matrix)) <= epsilon
  );
}
