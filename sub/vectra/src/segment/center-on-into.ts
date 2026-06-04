import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY, writeXY } from '../internal/xy';
import type { SegmentLike, SegmentWritable, XYInput, XYWritable } from '../types';

/**
 * segment의 midpoint를 target point로 이동한 결과를 out에 기록하고 out을 반환한다.
 * segment의 length와 direction을 보존한다. input/output aliasing 허용.
 *
 * @param out 결과를 기록할 writable segment output
 * @param line 이동할 segment
 * @param target midpoint를 맞출 target point
 */
export function centerOnInto<Out extends SegmentWritable<XYWritable, XYWritable>>(
  out: Out,
  line: SegmentLike,
  target: XYInput
): Out {
  // aliasing 안전: 모든 좌표를 먼저 읽는다
  const ax = readX(readSegmentA(line));
  const ay = readY(readSegmentA(line));
  const bx = readX(readSegmentB(line));
  const by = readY(readSegmentB(line));
  const tx = readX(target);
  const ty = readY(target);
  // midpoint
  const mx = (ax + bx) * 0.5;
  const my = (ay + by) * 0.5;
  // offset = target - midpoint
  const dx = tx - mx;
  const dy = ty - my;
  writeXY(out.a, ax + dx, ay + dy);
  writeXY(out.b, bx + dx, by + dy);
  return out;
}
