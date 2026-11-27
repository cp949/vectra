import type { Matrix, MatrixWritable } from '../types/flat-shapes.internal';

/**
 * matrix 오른쪽에 S(sx, sy)를 append한 결과(`matrix * S(sx, sy)`)를 out에 기록하고 out을 반환한다.
 *
 * 기존 matrix 오른쪽에 scale을 곱해 합성한다. input과 out이 같은 object여도 안전하다.
 *
 * @param out append 결과를 기록할 행렬 객체
 * @param matrix scale을 append할 기준 matrix
 * @param sx 오른쪽에 곱할 x축 scale
 * @param sy 오른쪽에 곱할 y축 scale
 */
export function appendScaleInto<Out extends MatrixWritable>(out: Out, matrix: Matrix, sx: number, sy: number): Out {
  const a = matrix.a;
  const b = matrix.b;
  const c = matrix.c;
  const d = matrix.d;
  const tx = matrix.tx;
  const ty = matrix.ty;
  // M * S(sx,sy): S = {a:sx,b:0,c:0,d:sy,tx:0,ty:0}
  // result.a = a*sx + c*0 = a*sx
  // result.b = b*sx + d*0 = b*sx
  // result.c = a*0 + c*sy = c*sy
  // result.d = b*0 + d*sy = d*sy
  // result.tx = a*0 + c*0 + tx = tx
  // result.ty = b*0 + d*0 + ty = ty
  out.a = a * sx;
  out.b = b * sx;
  out.c = c * sy;
  out.d = d * sy;
  out.tx = tx;
  out.ty = ty;
  return out;
}
