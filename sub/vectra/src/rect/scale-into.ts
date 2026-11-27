import type { Rect, RectWritable } from '../types/flat-shapes.internal';

/**
 * rect를 origin anchor 기준으로 scalar 배율 적용해 out에 기록한다.
 *
 * x/y/width/height에 모두 같은 scalar를 곱하며 정규화하지 않는다.
 * 음수 scalar는 음수 width/height인 empty rect를 만들 수 있다.
 * out과 rect가 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 사각형 객체
 * @param rect scale할 rect
 * @param scalar 곱할 배율
 */
export function scaleInto<Out extends RectWritable>(out: Out, rect: Rect, scalar: number): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const x = rect.x * scalar;
  const y = rect.y * scalar;
  const w = rect.width * scalar;
  const h = rect.height * scalar;
  out.x = x;
  out.y = y;
  out.width = w;
  out.height = h;
  return out;
}
