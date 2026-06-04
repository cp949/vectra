import { readMatrixA, readMatrixB, readMatrixC, readMatrixD, readMatrixTx, readMatrixTy } from '../internal/matrix';
import type { MatrixLike } from '../types';

/**
 * 두 matrix의 모든 component 차이가 epsilon 이하이면 true를 반환한다.
 *
 * epsilon은 각 component의 절대 차이에 적용된다.
 *
 * @param a 비교할 첫 번째 matrix
 * @param b 비교할 두 번째 matrix
 * @param epsilon 각 component에 적용할 절대 허용 오차
 */
export function nearEquals(a: MatrixLike, b: MatrixLike, epsilon = 1e-9): boolean {
  return (
    Math.abs(readMatrixA(a) - readMatrixA(b)) <= epsilon &&
    Math.abs(readMatrixB(a) - readMatrixB(b)) <= epsilon &&
    Math.abs(readMatrixC(a) - readMatrixC(b)) <= epsilon &&
    Math.abs(readMatrixD(a) - readMatrixD(b)) <= epsilon &&
    Math.abs(readMatrixTx(a) - readMatrixTx(b)) <= epsilon &&
    Math.abs(readMatrixTy(a) - readMatrixTy(b)) <= epsilon
  );
}
