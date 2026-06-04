import { readMatrixA, readMatrixB, readMatrixC, readMatrixD, readMatrixTx, readMatrixTy } from '../internal/matrix';
import type { MatrixLike } from '../types';

/**
 * 두 matrix의 모든 component가 정확히 같으면 true를 반환한다.
 *
 * 비교는 === 기준이며 epsilon을 적용하지 않는다.
 *
 * @param a 비교할 첫 번째 matrix
 * @param b 비교할 두 번째 matrix
 */
export function equals(a: MatrixLike, b: MatrixLike): boolean {
  return (
    readMatrixA(a) === readMatrixA(b) &&
    readMatrixB(a) === readMatrixB(b) &&
    readMatrixC(a) === readMatrixC(b) &&
    readMatrixD(a) === readMatrixD(b) &&
    readMatrixTx(a) === readMatrixTx(b) &&
    readMatrixTy(a) === readMatrixTy(b)
  );
}
