import { readPolylinePoints } from '../internal/polyline';
import { readX, readY, writeXY } from '../internal/xy';
import type { PolylineLike, SegmentWritable, XYWritable } from '../types';

/**
 * polyline의 index번째 segment를 out에 기록한다.
 *
 * invalid index, empty polyline, single-point polyline에서는 false를 반환하고 out을 수정하지 않는다.
 * out endpoint가 polyline point와 alias되어도 안전하다.
 *
 * @param out segment를 기록할 writable output
 * @param polyline segment를 읽을 polyline
 * @param index 읽을 segment index
 */
export function segmentAtInto(
  out: SegmentWritable<XYWritable, XYWritable>,
  polyline: PolylineLike,
  index: number
): boolean {
  const points = readPolylinePoints(polyline);
  const count = Math.max(0, points.length - 1);
  if (!Number.isInteger(index) || index < 0 || index >= count) {
    return false;
  }
  // out endpoint aliasing에 대비해 기록 전에 좌표를 모두 읽는다.
  const ax = readX(points[index]);
  const ay = readY(points[index]);
  const bx = readX(points[index + 1]);
  const by = readY(points[index + 1]);
  writeXY(out.a, ax, ay);
  writeXY(out.b, bx, by);
  return true;
}
