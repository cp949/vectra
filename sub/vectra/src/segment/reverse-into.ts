import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY, writeXY } from '../internal/xy';
import type { SegmentLike, SegmentWritable, XYWritable } from '../types';

/**
 * segment 끝점 → out.a, 시작점 → out.b 순으로 기록하고 out을 반환한다. input/output aliasing 허용.
 *
 * @param out 결과를 기록할 writable segment output
 * @param line 반전할 segment
 */
export function reverseInto<Out extends SegmentWritable<XYWritable, XYWritable>>(out: Out, line: SegmentLike): Out {
  // reverseInto(seg, seg) alias 호출에서도 안전하도록 모든 좌표를 먼저 읽는다
  const ax = readX(readSegmentA(line));
  const ay = readY(readSegmentA(line));
  const bx = readX(readSegmentB(line));
  const by = readY(readSegmentB(line));
  writeXY(out.a, bx, by);
  writeXY(out.b, ax, ay);
  return out;
}
