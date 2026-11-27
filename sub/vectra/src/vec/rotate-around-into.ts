import type { Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * input 벡터를 center 기준으로 CCW 회전하여 out에 기록하고 out을 반환한다.
 *
 * input 또는 center가 out과 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 점 객체
 * @param input 회전할 입력 벡터
 * @param center 회전 기준점
 * @param angle CCW 회전각(라디안)
 */
export function rotateAroundInto<Out extends PointWritable>(out: Out, input: Point, center: Point, angle: number): Out {
  // 모든 입력을 먼저 읽어 output aliasing을 방지한다.
  const ix = input.x;
  const iy = input.y;
  const cx = center.x;
  const cy = center.y;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const dx = ix - cx;
  const dy = iy - cy;

  out.x = cx + dx * cos - dy * sin;
  out.y = cy + dx * sin + dy * cos;
  return out;
}
