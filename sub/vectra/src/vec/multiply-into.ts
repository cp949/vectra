import type { Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * a와 b의 각 성분을 곱한 벡터를 out에 기록하고 out을 반환한다.
 *
 * a 또는 b가 out과 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 점 객체
 * @param a 곱할 첫 번째 벡터
 * @param b 곱할 두 번째 벡터
 */
export function multiplyInto<Out extends PointWritable>(out: Out, a: Point, b: Point): Out {
  out.x = a.x * b.x;
  out.y = a.y * b.y;
  return out;
}
