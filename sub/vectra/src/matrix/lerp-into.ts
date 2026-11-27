import type { Matrix, MatrixWritable } from '../types/flat-shapes.internal';

/**
 * 두 matrix a, b를 parameter t로 component-wise 선형 보간한 결과를 out에 기록하고 out을 반환한다.
 *
 * 각 component: `out.x = a.x + (b.x - a.x) * t`.
 * t는 clamp하지 않으므로 t < 0 또는 t > 1로 extrapolation이 가능하다.
 * t가 NaN 또는 Infinity이면 결과가 정의되지 않는다 (caller 책임).
 *
 * `out`과 `a` 또는 `b`가 같은 object여도 안전하다 (aliasing safe).
 *
 * @param out 보간 결과를 기록할 행렬 객체
 * @param a 시작 matrix (t = 0일 때 결과)
 * @param b 끝 matrix (t = 1일 때 결과)
 * @param t 보간 parameter. clamp 없이 extrapolation 허용.
 */
export function lerpInto<Out extends MatrixWritable>(out: Out, a: Matrix, b: Matrix, t: number): Out {
  const aA = a.a;
  const aB = a.b;
  const aC = a.c;
  const aD = a.d;
  const aTx = a.tx;
  const aTy = a.ty;

  const bA = b.a;
  const bB = b.b;
  const bC = b.c;
  const bD = b.d;
  const bTx = b.tx;
  const bTy = b.ty;

  out.a = aA + (bA - aA) * t;
  out.b = aB + (bB - aB) * t;
  out.c = aC + (bC - aC) * t;
  out.d = aD + (bD - aD) * t;
  out.tx = aTx + (bTx - aTx) * t;
  out.ty = aTy + (bTy - aTy) * t;
  return out;
}
