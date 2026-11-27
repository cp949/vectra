import type { Segment, Point, PointWritable } from '../types/flat-shapes.internal';
import { closestPointOnSegment } from './closest-point.internal';

/**
 * t를 [0, 1]로 clamp한 closest point를 out에 기록하고 out을 반환한다. zero-length segment는 시작점을 기록한다.
 *
 * @param out 최근접점을 기록할 점 객체
 * @param line 대상 segment
 * @param point closest point를 측정할 기준 point
 */
export function closestPointInto<Out extends PointWritable>(out: Out, line: Segment, point: Point): Out {
  const ax = line.x1;
  const ay = line.y1;
  const bx = line.x2;
  const by = line.y2;
  const px = point.x;
  const py = point.y;
  const cp = closestPointOnSegment(ax, ay, bx, by, px, py);
  out.x = cp.x;
  out.y = cp.y;
  return out;
}
