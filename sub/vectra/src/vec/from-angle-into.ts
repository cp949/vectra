import { writeXY } from '../internal/xy';
import type { XYWritable } from '../types';

/**
 * 주어진 각도에 해당하는 unit vector (cos(angle), sin(angle))를 out에 기록하고 out을 반환한다.
 *
 * @param out 결과를 기록할 writable output
 * @param angle unit vector 방향각(라디안)
 */
export function fromAngleInto<Out extends XYWritable>(out: Out, angle: number): Out {
  return writeXY(out, Math.cos(angle), Math.sin(angle));
}
