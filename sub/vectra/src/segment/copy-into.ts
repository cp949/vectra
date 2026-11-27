import type { Segment, SegmentWritable } from '../types/flat-shapes.internal';

/**
 * 선분의 두 끝점을 out에 복사하고 out을 반환한다. 입력과 출력이 같아도 안전하다.
 *
 * @param out 결과를 기록할 선분 객체
 * @param line 복사할 선분
 */
export function copyInto<Out extends SegmentWritable>(out: Out, line: Segment): Out {
  const { x1, y1, x2, y2 } = line;
  out.x1 = x1;
  out.y1 = y1;
  out.x2 = x2;
  out.y2 = y2;
  return out;
}
