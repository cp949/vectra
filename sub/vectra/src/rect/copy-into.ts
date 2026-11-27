import type { Rect, RectWritable } from '../types/flat-shapes.internal';

/**
 * 사각형의 필드를 out에 복사한다.
 *
 * width/height를 정규화하지 않고 입력값 그대로 기록한다.
 * out과 source rect가 같은 object여도 안전하다.
 *
 * @param out rect component를 기록할 사각형 객체
 * @param rect 복사할 source rect
 */
export function copyInto<Out extends RectWritable>(out: Out, rect: Rect): Out {
  const { x, y, width, height } = rect;
  out.x = x;
  out.y = y;
  out.width = width;
  out.height = height;
  return out;
}
