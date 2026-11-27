import type { Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * input의 각 성분의 절댓값으로 구성된 벡터를 out에 기록하고 out을 반환한다.
 *
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 점 객체
 * @param input 절댓값을 취할 입력 벡터
 */
export function absInto<Out extends PointWritable>(out: Out, input: Point): Out {
  const x = Math.abs(input.x);
  const y = Math.abs(input.y);
  out.x = x;
  out.y = y;
  return out;
}
