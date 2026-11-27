import type { Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * a에서 b * scalar를 뺀 벡터를 out에 기록하고 out을 반환한다.
 *
 * b를 먼저 scalar로 곱한 뒤 a에서 뺀다.
 * out이 a 또는 b와 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 점 객체
 * @param a 기준 벡터
 * @param b scalar를 곱한 뒤 뺄 벡터
 * @param scalar b에 곱할 스칼라값
 */
export function subtractScaledInto<Out extends PointWritable>(out: Out, a: Point, b: Point, scalar: number): Out {
  const x = a.x - b.x * scalar;
  const y = a.y - b.y * scalar;
  out.x = x;
  out.y = y;
  return out;
}
