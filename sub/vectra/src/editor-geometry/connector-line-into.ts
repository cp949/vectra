import type { Bounds, SegmentWritable } from '../types/flat-shapes.internal';

/**
 * 두 bounds의 center를 잇는 segment를 out에 기록하고 같은 out을 반환한다.
 *
 * bounds center는 각 bounds의 min/max 중점이다.
 * NaN/Infinity 입력은 silent propagation. throw 없음.
 * 두 경계의 중심을 구한 뒤 출력 필드를 기록한다.
 *
 * @param out 연결선을 기록할 출력 { x1, y1, x2, y2 }
 * @param from 출발 bounds
 * @param to 도착 bounds
 */
export function connectorLineInto<Out extends SegmentWritable>(out: Out, from: Bounds, to: Bounds): Out {
  const ax = (from.minX + from.maxX) / 2;
  const ay = (from.minY + from.maxY) / 2;
  const bx = (to.minX + to.maxX) / 2;
  const by = (to.minY + to.maxY) / 2;

  out.x1 = ax;
  out.y1 = ay;
  out.x2 = bx;
  out.y2 = by;
  return out;
}
