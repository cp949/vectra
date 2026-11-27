import type { Rect, PointWritable } from '../types/flat-shapes.internal';

/**
 * rect의 bottom-left corner를 out에 기록한다.
 *
 * height를 정규화하지 않고 `x`, `y + height`를 그대로 기록한다.
 * out과 rect가 같은 storage를 공유해도 안전하다.
 *
 * @param out bottom-left 좌표를 기록할 점 객체
 * @param rect bottom-left 좌표를 읽을 rect
 */
export function bottomLeftInto<Out extends PointWritable>(out: Out, rect: Rect): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const x = rect.x;
  const y = rect.y + rect.height;
  out.x = x;
  out.y = y;
  return out;
}
