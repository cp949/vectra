import type { Segment, Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * unclamped t로 계산한 projection point를 out에 기록하고 out을 반환한다. zero-length segment는 시작점을 기록한다.
 *
 * @param out 투영점을 기록할 점 객체
 * @param line 대상 segment
 * @param point segment에 투영할 point
 */
export function projectPointInto<Out extends PointWritable>(out: Out, line: Segment, point: Point): Out {
  const ax = line.x1;
  const ay = line.y1;
  const dx = line.x2 - ax;
  const dy = line.y2 - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    out.x = ax;
    out.y = ay;
    return out;
  }
  const px = point.x - ax;
  const py = point.y - ay;
  const t = (px * dx + py * dy) / lenSq;
  out.x = ax + t * dx;
  out.y = ay + t * dy;
  return out;
}
