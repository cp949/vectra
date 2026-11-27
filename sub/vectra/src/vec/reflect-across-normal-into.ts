import type { Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * vector를 unit normal에 대해 반사한 벡터를 out에 기록하고 out을 반환한다.
 *
 * `vector - 2 * dot(vector, normal) * normal`. normal은 unit vector 전제 (정규화 없음).
 *
 * @param out 결과를 기록할 점 객체
 * @param vector 반사할 벡터
 * @param normal 반사 기준 법선 벡터 (unit vector 전제)
 */
export function reflectAcrossNormalInto<Out extends PointWritable>(out: Out, vector: Point, normal: Point): Out {
  const vx = vector.x;
  const vy = vector.y;
  const nx = normal.x;
  const ny = normal.y;
  const dot2 = 2 * (vx * nx + vy * ny);
  out.x = vx - dot2 * nx;
  out.y = vy - dot2 * ny;
  return out;
}
