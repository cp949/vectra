import type { Segment, SegmentWritable, Point } from '../types/flat-shapes.internal';

/**
 * segment의 midpoint를 target point로 이동한 결과를 out에 기록하고 out을 반환한다.
 * segment의 length와 direction을 보존한다. input/output aliasing 허용.
 *
 * @param out 결과를 기록할 선분 객체
 * @param line 이동할 segment
 * @param target midpoint를 맞출 target point
 */
export function centerOnInto<Out extends SegmentWritable>(out: Out, line: Segment, target: Point): Out {
  // aliasing 안전: 모든 좌표를 먼저 읽는다
  const ax = line.x1;
  const ay = line.y1;
  const bx = line.x2;
  const by = line.y2;
  const tx = target.x;
  const ty = target.y;
  // midpoint
  const mx = (ax + bx) * 0.5;
  const my = (ay + by) * 0.5;
  // offset = target - midpoint
  const dx = tx - mx;
  const dy = ty - my;
  out.x1 = ax + dx;
  out.y1 = ay + dy;
  out.x2 = bx + dx;
  out.y2 = by + dy;
  return out;
}
