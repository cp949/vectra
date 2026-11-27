import type { Point, Rect, RectWritable } from '../types/flat-shapes.internal';

/**
 * rect를 offset만큼 이동한 결과를 out에 기록한다.
 *
 * width/height는 그대로 보존한다.
 * out과 rect 또는 offset이 같은 storage를 공유해도 안전하다.
 *
 * @param out 결과를 기록할 사각형 객체
 * @param rect 이동할 rect
 * @param offset x/y에 더할 offset
 */
export function translateInto<Out extends RectWritable>(out: Out, rect: Rect, offset: Point): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const x = rect.x + offset.x;
  const y = rect.y + offset.y;
  const w = rect.width;
  const h = rect.height;
  out.x = x;
  out.y = y;
  out.width = w;
  out.height = h;
  return out;
}
