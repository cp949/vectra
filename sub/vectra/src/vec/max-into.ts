import type { Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * a와 b의 각 성분 중 더 큰 값으로 구성된 벡터를 out에 기록하고 out을 반환한다.
 *
 * a 또는 b가 out과 같은 object여도 안전하다.
 * NaN, Infinity, -Infinity 입력은 Math.max 정책을 따른다.
 *
 * @param out 결과를 기록할 writable output
 * @param a 첫 번째 입력 벡터
 * @param b 두 번째 입력 벡터
 */
export function maxInto<Out extends PointWritable>(out: Out, a: Point, b: Point): Out {
  const ax = a.x;
  const ay = a.y;
  const bx = b.x;
  const by = b.y;
  out.x = Math.max(ax, bx);
  out.y = Math.max(ay, by);
  return out;
}
