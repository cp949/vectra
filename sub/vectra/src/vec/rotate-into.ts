import type { Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * input 벡터를 원점 기준으로 CCW 회전하여 out에 기록하고 out을 반환한다.
 *
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 점 객체
 * @param input 회전할 입력 벡터
 * @param angle CCW 회전각(라디안)
 */
export function rotateInto<Out extends PointWritable>(out: Out, input: Point, angle: number): Out {
  const x = input.x;
  const y = input.y;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  out.x = x * cos - y * sin;
  out.y = x * sin + y * cos;
  return out;
}
