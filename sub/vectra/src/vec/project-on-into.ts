import type { Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * vector를 unit direction에 투영한 벡터를 out에 기록하고 out을 반환한다.
 *
 * `dot(vector, direction) * direction`. direction은 unit vector 전제 (정규화 없음).
 *
 * @param out 결과를 기록할 점 객체
 * @param vector 투영할 벡터
 * @param direction 투영 방향 (unit vector 전제)
 */
export function projectOnInto<Out extends PointWritable>(out: Out, vector: Point, direction: Point): Out {
  const vx = vector.x;
  const vy = vector.y;
  const dx = direction.x;
  const dy = direction.y;

  const dot = vx * dx + vy * dy;

  out.x = dot * dx;
  out.y = dot * dy;
  return out;
}
