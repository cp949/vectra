import type { PointWritable } from '../types/flat-shapes.internal';

/**
 * 주어진 각도에 해당하는 unit vector (cos(angle), sin(angle))를 out에 기록하고 out을 반환한다.
 *
 * @param out 결과를 기록할 점 객체
 * @param angle unit vector 방향각(라디안)
 */
export function fromAngleInto<Out extends PointWritable>(out: Out, angle: number): Out {
  out.x = Math.cos(angle);
  out.y = Math.sin(angle);
  return out;
}
