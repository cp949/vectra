import { readMatrixA, readMatrixB, readMatrixC, readMatrixD, readMatrixTx, readMatrixTy } from '../internal/matrix';
import type { MatrixLike, MatrixWritable } from '../types';

/**
 * matrix의 inverse를 out에 기록하고 성공 여부를 반환한다.
 *
 * determinant === 0이면 false를 반환하고 out을 수정하지 않는다. determinant 판정은 exact check이며
 * epsilon은 적용하지 않는다.
 *
 * @param out inverse matrix를 기록할 writable output
 * @param matrix inverse를 계산할 matrix
 */
export function invertInto<Out extends MatrixWritable>(out: Out, matrix: MatrixLike): boolean {
  const a = readMatrixA(matrix);
  const b = readMatrixB(matrix);
  const c = readMatrixC(matrix);
  const d = readMatrixD(matrix);
  const tx = readMatrixTx(matrix);
  const ty = readMatrixTy(matrix);
  const det = a * d - b * c;
  if (det === 0) return false;
  const invDet = 1 / det;
  out.a = d * invDet;
  out.b = -b * invDet;
  out.c = -c * invDet;
  out.d = a * invDet;
  out.tx = (c * ty - d * tx) * invDet;
  out.ty = (b * tx - a * ty) * invDet;
  return true;
}
