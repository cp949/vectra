import type { Polyline, SegmentWritable } from '../types/flat-shapes.internal';

/**
 * polyline의 index번째 segment를 out에 기록한다.
 *
 * invalid index, empty polyline, single-point polyline에서는 false를 반환하고 out을 수정하지 않는다.
 *
 * @param out segment를 기록할 writable output (`x1`, `y1`, `x2`, `y2`)
 * @param polyline segment를 읽을 polyline
 * @param index 읽을 segment index
 */
export function segmentAtInto(out: SegmentWritable, polyline: Polyline, index: number): boolean {
  const points = polyline;
  const count = Math.max(0, points.length - 1);
  if (!Number.isInteger(index) || index < 0 || index >= count) {
    return false;
  }
  const ax = points[index].x;
  const ay = points[index].y;
  const bx = points[index + 1].x;
  const by = points[index + 1].y;
  out.x1 = ax;
  out.y1 = ay;
  out.x2 = bx;
  out.y2 = by;
  return true;
}
