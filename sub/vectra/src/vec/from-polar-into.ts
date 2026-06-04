import { writeXY } from '../internal/xy';
import type { XYWritable } from '../types';

/**
 * 극좌표 (r, theta)를 XY 벡터로 변환해 out에 기록하고 out을 반환한다.
 *
 * x = r * cos(theta), y = r * sin(theta).
 *
 * @param out 결과를 기록할 writable output
 * @param r 반지름 (벡터의 길이)
 * @param theta 각도 (라디안, x축으로부터 반시계 방향)
 */
export function fromPolarInto<Out extends XYWritable>(out: Out, r: number, theta: number): Out {
  return writeXY(out, r * Math.cos(theta), r * Math.sin(theta));
}
