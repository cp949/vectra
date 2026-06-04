import { readMatrixA, readMatrixB, readMatrixC, readMatrixD, readMatrixTx, readMatrixTy } from '../internal/matrix';
import type { MatrixLike } from '../types';

/**
 * matrix의 6개 component를 mutable 6-element tuple out에 기록하고 out을 반환한다.
 *
 * 기록 순서: `[a, b, c, d, tx, ty]`. MatrixTuple과 동일한 순서이다.
 * NaN/Infinity component는 검증 없이 pass through한다.
 *
 * @param out matrix component를 기록할 mutable 6-element tuple
 * @param matrix 읽을 matrix
 */
export function toArray6Into(
  out: [number, number, number, number, number, number],
  matrix: MatrixLike
): [number, number, number, number, number, number] {
  out[0] = readMatrixA(matrix);
  out[1] = readMatrixB(matrix);
  out[2] = readMatrixC(matrix);
  out[3] = readMatrixD(matrix);
  out[4] = readMatrixTx(matrix);
  out[5] = readMatrixTy(matrix);
  return out;
}
