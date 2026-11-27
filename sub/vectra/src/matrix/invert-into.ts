import type { Matrix, MatrixWritable } from '../types/flat-shapes.internal';

/**
 * matrix의 inverse를 out에 기록하고 성공 여부를 반환한다.
 *
 * determinant === 0이면 false를 반환하고 out을 수정하지 않는다. determinant 판정은 exact check이며
 * epsilon은 적용하지 않는다.
 *
 * @param out inverse matrix를 기록할 행렬 객체
 * @param matrix inverse를 계산할 matrix
 */
export function invertInto(out: MatrixWritable, matrix: Matrix): boolean {
  const a = matrix.a;
  const b = matrix.b;
  const c = matrix.c;
  const d = matrix.d;
  const tx = matrix.tx;
  const ty = matrix.ty;
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
