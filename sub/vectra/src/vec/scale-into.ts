import type { Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * input에 scalar를 곱한 벡터를 out에 기록하고 out을 반환한다.
 *
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 점 객체
 * @param input 배율을 적용할 입력 벡터
 * @param scalar 각 성분에 곱할 스칼라 값
 */
export function scaleInto<Out extends PointWritable>(out: Out, input: Point, scalar: number): Out {
  const x = input.x * scalar;
  const y = input.y * scalar;
  out.x = x;
  out.y = y;
  return out;
}
