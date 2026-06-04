import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY, writeXY } from '../internal/xy';
import type { SegmentLike, SegmentWritable, XYInput, XYWritable } from '../types';

/**
 * segment의 모든 endpoint에 offset을 더하여 out에 기록하고 out을 반환한다. input/output aliasing 허용.
 *
 * @param out 결과를 기록할 writable segment output
 * @param line 이동할 segment
 * @param offset 이동 벡터
 */
export function translateInto<Out extends SegmentWritable<XYWritable, XYWritable>>(
  out: Out,
  line: SegmentLike,
  offset: XYInput
): Out {
  // translateInto(seg, seg, ...) alias 호출에서도 안전하도록 모든 좌표를 먼저 읽는다
  const ax = readX(readSegmentA(line));
  const ay = readY(readSegmentA(line));
  const bx = readX(readSegmentB(line));
  const by = readY(readSegmentB(line));
  const ox = readX(offset);
  const oy = readY(offset);
  writeXY(out.a, ax + ox, ay + oy);
  writeXY(out.b, bx + ox, by + oy);
  return out;
}
