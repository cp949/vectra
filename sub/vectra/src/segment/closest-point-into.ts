import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY, writeXY } from '../internal/xy';
import type { SegmentLike, XYInput, XYWritable } from '../types';
import { closestPointOnSegment } from './closest-point.internal';

/**
 * t를 [0, 1]로 clamp한 closest point를 out에 기록하고 out을 반환한다. zero-length segment는 시작점을 기록한다.
 *
 * @param out closest point를 기록할 writable output
 * @param line 대상 segment
 * @param point closest point를 측정할 기준 point
 */
export function closestPointInto<Out extends XYWritable>(out: Out, line: SegmentLike, point: XYInput): Out {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const ax = readX(a);
  const ay = readY(a);
  const bx = readX(b);
  const by = readY(b);
  const px = readX(point);
  const py = readY(point);
  const cp = closestPointOnSegment(ax, ay, bx, by, px, py);
  return writeXY(out, cp.x, cp.y);
}
