import type { Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * a와 b를 더한 벡터를 out에 기록하고 out을 반환한다.
 *
 * a 또는 b가 out과 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 점 객체
 * @param a 더할 첫 번째 벡터
 * @param b 더할 두 번째 벡터
 */
export function addInto<Out extends PointWritable>(out: Out, a: Point, b: Point): Out {
  const x = a.x + b.x;
  const y = a.y + b.y;
  out.x = x;
  out.y = y;
  return out;
}
