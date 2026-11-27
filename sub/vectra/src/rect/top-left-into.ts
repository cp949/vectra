import type { PointWritable, Rect } from '../types/flat-shapes.internal';

/**
 * rect의 top-left corner를 out에 기록한다.
 *
 * out과 rect가 같은 storage를 공유해도 안전하다.
 *
 * @param out top-left 좌표를 기록할 점 객체
 * @param rect top-left 좌표를 읽을 rect
 */
export function topLeftInto<Out extends PointWritable>(out: Out, rect: Rect): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const x = rect.x;
  const y = rect.y;
  out.x = x;
  out.y = y;
  return out;
}
