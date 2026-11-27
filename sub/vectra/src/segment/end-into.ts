import type { Segment, PointWritable } from '../types/flat-shapes.internal';

/**
 * segment 끝점을 out에 기록하고 out을 반환한다.
 *
 * @param out 끝점을 기록할 점 객체
 * @param line 대상 segment
 */
export function endInto<Out extends PointWritable>(out: Out, line: Segment): Out {
  const { x2, y2 } = line;
  out.x = x2;
  out.y = y2;
  return out;
}
