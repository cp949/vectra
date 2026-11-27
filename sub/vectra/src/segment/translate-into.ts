import type { Point, Segment, SegmentWritable } from '../types/flat-shapes.internal';

/**
 * segment의 모든 endpoint에 offset을 더하여 out에 기록하고 out을 반환한다. input/output aliasing 허용.
 *
 * @param out 결과를 기록할 선분 객체
 * @param line 이동할 segment
 * @param offset 이동 벡터
 */
export function translateInto<Out extends SegmentWritable>(out: Out, line: Segment, offset: Point): Out {
  // translateInto(seg, seg, ...) alias 호출에서도 안전하도록 모든 좌표를 먼저 읽는다
  const ax = line.x1;
  const ay = line.y1;
  const bx = line.x2;
  const by = line.y2;
  const ox = offset.x;
  const oy = offset.y;
  out.x1 = ax + ox;
  out.y1 = ay + oy;
  out.x2 = bx + ox;
  out.y2 = by + oy;
  return out;
}
