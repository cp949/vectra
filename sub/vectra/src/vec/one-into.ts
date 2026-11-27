import type { PointWritable } from '../types/flat-shapes.internal';

/**
 * out에 (1, 1)을 기록하고 out을 반환한다.
 *
 * @param out 결과를 기록할 점 객체
 */
export function oneInto<Out extends PointWritable>(out: Out): Out {
  out.x = 1;
  out.y = 1;
  return out;
}
