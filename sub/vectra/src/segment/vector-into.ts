import type { PointWritable, Segment } from '../types/flat-shapes.internal';

/**
 * b - a 벡터를 out에 기록하고 out을 반환한다.
 *
 * @param out 벡터를 기록할 점 객체
 * @param line 대상 segment
 */
export function vectorInto<Out extends PointWritable>(out: Out, line: Segment): Out {
  const dx = line.x2 - line.x1;
  const dy = line.y2 - line.y1;
  out.x = dx;
  out.y = dy;
  return out;
}
