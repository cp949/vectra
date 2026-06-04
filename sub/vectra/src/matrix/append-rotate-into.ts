import { readMatrixA, readMatrixB, readMatrixC, readMatrixD, readMatrixTx, readMatrixTy } from '../internal/matrix';
import type { MatrixLike, MatrixWritable } from '../types';

/**
 * matrix 오른쪽에 R(angle)을 append한 결과(`matrix * R(angle)`)를 out에 기록하고 out을 반환한다.
 *
 * 기존 matrix 오른쪽에 rotation을 곱해 합성한다. angle은 radian이며, input과 out이 같은 object여도 안전하다.
 *
 * @param out append 결과를 기록할 writable output
 * @param matrix rotation을 append할 기준 matrix
 * @param angle 오른쪽에 곱할 rotation angle
 */
export function appendRotateInto<Out extends MatrixWritable>(out: Out, matrix: MatrixLike, angle: number): Out {
  const a = readMatrixA(matrix);
  const b = readMatrixB(matrix);
  const c = readMatrixC(matrix);
  const d = readMatrixD(matrix);
  const tx = readMatrixTx(matrix);
  const ty = readMatrixTy(matrix);
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  // M * R(angle): R = {a:cos,b:sin,c:-sin,d:cos,tx:0,ty:0}
  // result.a = a*cos + c*sin
  // result.b = b*cos + d*sin
  // result.c = a*(-sin) + c*cos
  // result.d = b*(-sin) + d*cos
  // result.tx = a*0 + c*0 + tx = tx
  // result.ty = b*0 + d*0 + ty = ty
  out.a = a * cosA + c * sinA;
  out.b = b * cosA + d * sinA;
  out.c = -a * sinA + c * cosA;
  out.d = -b * sinA + d * cosA;
  out.tx = tx;
  out.ty = ty;
  return out;
}
