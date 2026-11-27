import type { Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * vector를 normal에 대해 반사한 벡터를 out에 기록하고 out을 반환한다.
 *
 * `vector - 2 * dot(vector, normal) / lengthSq(normal) * normal`. normal은 임의 길이다.
 * `lengthSq(normal) === 0`이면 vector를 그대로 out에 복사한다.
 * input과 out이 같은 object여도 안전하다.
 * non-finite 입력은 검증 없이 pass through한다.
 *
 * @param out 결과를 기록할 점 객체
 * @param vector 반사할 벡터
 * @param normal 반사 기준 법선 벡터 (임의 길이)
 */
export function reflectInto<Out extends PointWritable>(out: Out, vector: Point, normal: Point): Out {
  const vx = vector.x;
  const vy = vector.y;
  const nx = normal.x;
  const ny = normal.y;
  const lsq = nx * nx + ny * ny;
  if (lsq === 0) {
    out.x = vx;
    out.y = vy;
  } else {
    const scale = (2 * (vx * nx + vy * ny)) / lsq;
    out.x = vx - scale * nx;
    out.y = vy - scale * ny;
  }
  return out;
}
