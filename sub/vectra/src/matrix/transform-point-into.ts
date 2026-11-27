import type { Matrix, Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * point에 matrix를 적용한 결과를 out에 기록하고 out을 반환한다.
 *
 * translation component tx/ty를 포함한다. input과 out이 같은 object여도 안전하다.
 *
 * @param out 변환된 point를 기록할 객체
 * @param matrix point에 적용할 matrix
 * @param point 변환할 point
 */
export function transformPointInto<Out extends PointWritable>(out: Out, matrix: Matrix, point: Point): Out {
  const a = matrix.a;
  const b = matrix.b;
  const c = matrix.c;
  const d = matrix.d;
  const tx = matrix.tx;
  const ty = matrix.ty;
  // aliasing 안전: input x/y를 먼저 읽은 뒤 out에 기록한다
  const x = point.x;
  const y = point.y;
  out.x = a * x + c * y + tx;
  out.y = b * x + d * y + ty;
  return out;
}
