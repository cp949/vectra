import type { PointWritable, Segment } from '../types/flat-shapes.internal';

/**
 * (a + b) / 2 중점을 out에 기록하고 out을 반환한다.
 *
 * @param out 중점을 기록할 점 객체
 * @param line 대상 segment
 */
export function midpointInto<Out extends PointWritable>(out: Out, line: Segment): Out {
  const mx = (line.x1 + line.x2) * 0.5;
  const my = (line.y1 + line.y2) * 0.5;
  out.x = mx;
  out.y = my;
  return out;
}
