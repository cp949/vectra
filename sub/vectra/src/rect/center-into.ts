import type { Rect, PointWritable } from '../types/flat-shapes.internal';

/**
 * rect의 center 좌표를 out에 기록한다.
 *
 * empty rect도 raw 산식 `x + width / 2`, `y + height / 2`를 그대로 사용한다.
 * out과 rect가 같은 storage를 공유해도 안전하다.
 *
 * @param out center 좌표를 기록할 점 객체
 * @param rect center 좌표를 읽을 rect
 */
export function centerInto<Out extends PointWritable>(out: Out, rect: Rect): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  out.x = cx;
  out.y = cy;
  return out;
}
