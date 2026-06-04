import { readMatrixA, readMatrixB, readMatrixC, readMatrixD, readMatrixTx, readMatrixTy } from '../internal/matrix';
import { readX, readY } from '../internal/xy';
import type { MatrixLike, MatrixWritable, XYInput } from '../types';

/**
 * matrix 오른쪽에 T(offset)을 append한 결과(`matrix * T(offset)`)를 out에 기록하고 out을 반환한다.
 *
 * 기존 matrix 오른쪽에 translation을 곱해 합성한다. input과 out이 같은 object여도 안전하다.
 *
 * @param out append 결과를 기록할 writable output
 * @param matrix translation을 append할 기준 matrix
 * @param offset 오른쪽에 곱할 translation offset
 */
export function appendTranslateInto<Out extends MatrixWritable>(out: Out, matrix: MatrixLike, offset: XYInput): Out {
  const a = readMatrixA(matrix);
  const b = readMatrixB(matrix);
  const c = readMatrixC(matrix);
  const d = readMatrixD(matrix);
  const tx = readMatrixTx(matrix);
  const ty = readMatrixTy(matrix);
  const ox = readX(offset);
  const oy = readY(offset);
  // M * T(ox,oy): T = {a:1,b:0,c:0,d:1,tx:ox,ty:oy}
  // result.a = a*1 + c*0 = a
  // result.b = b*1 + d*0 = b
  // result.c = a*0 + c*1 = c
  // result.d = b*0 + d*1 = d
  // result.tx = a*ox + c*oy + tx
  // result.ty = b*ox + d*oy + ty
  out.a = a;
  out.b = b;
  out.c = c;
  out.d = d;
  out.tx = a * ox + c * oy + tx;
  out.ty = b * ox + d * oy + ty;
  return out;
}
