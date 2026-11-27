import type { Matrix, Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * vector에 matrix의 linear part를 적용한 결과를 out에 기록하고 out을 반환한다.
 *
 * translation component tx/ty는 의도적으로 무시한다. direction, normal, velocity 같은 free vector에
 * 사용한다. input과 out이 같은 object여도 안전하다.
 *
 * @param out 변환된 vector를 기록할 점 객체
 * @param matrix vector에 적용할 matrix
 * @param vector 변환할 free vector
 */
export function transformVectorInto<Out extends PointWritable>(out: Out, matrix: Matrix, vector: Point): Out {
  const a = matrix.a;
  const b = matrix.b;
  const c = matrix.c;
  const d = matrix.d;
  // aliasing 안전: input x/y를 먼저 읽은 뒤 out에 기록한다
  const x = vector.x;
  const y = vector.y;
  // translation tx/ty를 의도적으로 제외한다 — direction/normal/velocity 같은 free vector에 사용
  out.x = a * x + c * y;
  out.y = b * x + d * y;
  return out;
}
