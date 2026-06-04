import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsLike, SegmentWritable, XYWritable } from '../types';

/**
 * 두 bounds의 center를 잇는 segment를 out에 기록하고 같은 out을 반환한다.
 *
 * bounds center는 각 bounds의 min/max 중점이다.
 * NaN/Infinity 입력은 silent propagation. throw 없음.
 * out endpoint가 from/to bounds point와 alias되어도 안전하다.
 *
 * @param out segment를 기록할 writable output
 * @param from 출발 bounds
 * @param to 도착 bounds
 */
export function connectorLineInto<Out extends SegmentWritable<XYWritable, XYWritable>>(
  out: Out,
  from: BoundsLike,
  to: BoundsLike
): Out {
  const fromMin = readBoundsMin(from);
  const fromMax = readBoundsMax(from);
  const toMin = readBoundsMin(to);
  const toMax = readBoundsMax(to);

  const ax = (readX(fromMin) + readX(fromMax)) / 2;
  const ay = (readY(fromMin) + readY(fromMax)) / 2;
  const bx = (readX(toMin) + readX(toMax)) / 2;
  const by = (readY(toMin) + readY(toMax)) / 2;

  writeXY(out.a, ax, ay);
  writeXY(out.b, bx, by);
  return out;
}
