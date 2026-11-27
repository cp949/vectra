import type { Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * vector에서 basis 방향 성분을 제거한 벡터를 out에 기록하고 out을 반환한다.
 *
 * `vector - dot(vector, basis) / lengthSq(basis) * basis`. basis는 임의 길이다.
 * `lengthSq(basis) === 0`이면 vector를 그대로 out에 복사한다.
 * input과 out이 같은 object여도 안전하다.
 * non-finite 입력은 검증 없이 pass through한다.
 *
 * @param out 결과를 기록할 점 객체
 * @param vector 분리할 벡터
 * @param basis 제거할 방향 벡터 (임의 길이)
 */
export function rejectFromInto<Out extends PointWritable>(out: Out, vector: Point, basis: Point): Out {
  const vx = vector.x;
  const vy = vector.y;
  const bx = basis.x;
  const by = basis.y;
  const lsq = bx * bx + by * by;
  if (lsq === 0) {
    out.x = vx;
    out.y = vy;
    return out;
  }
  const scale = (vx * bx + vy * by) / lsq;
  out.x = vx - scale * bx;
  out.y = vy - scale * by;
  return out;
}
