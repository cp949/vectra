import type { PointWritable, Segment } from '../types/flat-shapes.internal';

/**
 * segment 시작점을 out에 기록하고 out을 반환한다.
 *
 * @param out 시작점을 기록할 점 객체
 * @param line 대상 segment
 */
export function startInto<Out extends PointWritable>(out: Out, line: Segment): Out {
  const { x1, y1 } = line;
  out.x = x1;
  out.y = y1;
  return out;
}
