import type { PointWritable, Rect } from '../types/flat-shapes.internal';

/**
 * rect의 size를 out에 기록한다.
 *
 * width/height를 정규화하지 않고 그대로 기록한다.
 * out과 rect가 같은 storage를 공유해도 안전하다.
 *
 * @param out 너비를 x에, 높이를 y에 기록할 점 객체
 * @param rect size를 읽을 rect
 */
export function sizeInto<Out extends PointWritable>(out: Out, rect: Rect): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const w = rect.width;
  const h = rect.height;
  out.x = w;
  out.y = h;
  return out;
}
