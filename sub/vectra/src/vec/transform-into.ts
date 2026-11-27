import type { Matrix, Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * point에 matrix를 적용한 결과를 out에 기록하고 out을 반환한다.
 *
 * translation component tx/ty를 포함한다. input과 out이 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 점 객체
 * @param input 변환할 point
 * @param matrix point에 적용할 matrix
 */
export function transformInto<Out extends PointWritable>(out: Out, input: Point, matrix: Matrix): Out {
  const x = input.x;
  const y = input.y;
  const a = matrix.a;
  const b = matrix.b;
  const c = matrix.c;
  const d = matrix.d;
  const tx = matrix.tx;
  const ty = matrix.ty;
  out.x = a * x + c * y + tx;
  out.y = b * x + d * y + ty;
  return out;
}
