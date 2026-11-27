import type { PointWritable } from '../types/flat-shapes.internal';

/**
 * out에 (0, 0)을 기록하고 out을 반환한다.
 *
 * @param out 결과를 기록할 점 객체
 */
export function zeroInto<Out extends PointWritable>(out: Out): Out {
  out.x = 0;
  out.y = 0;
  return out;
}
