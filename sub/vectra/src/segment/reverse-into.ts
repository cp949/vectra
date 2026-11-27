import type { Segment, SegmentWritable } from '../types/flat-shapes.internal';

/**
 * 선분의 끝점을 out의 시작점에, 시작점을 out의 끝점에 기록하고 out을 반환한다. 입력과 출력은 같은 객체여도 된다.
 *
 * @param out 결과를 기록할 선분 객체
 * @param line 반전할 segment
 */
export function reverseInto<Out extends SegmentWritable>(out: Out, line: Segment): Out {
  // reverseInto(seg, seg) alias 호출에서도 안전하도록 모든 좌표를 먼저 읽는다
  const ax = line.x1;
  const ay = line.y1;
  const bx = line.x2;
  const by = line.y2;
  out.x1 = bx;
  out.y1 = by;
  out.x2 = ax;
  out.y2 = ay;
  return out;
}
