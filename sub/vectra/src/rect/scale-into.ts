import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import type { RectLike, RectWritable } from '../types';

/**
 * rect를 origin anchor 기준으로 scalar 배율 적용해 out에 기록한다.
 *
 * x/y/width/height에 모두 같은 scalar를 곱하며 정규화하지 않는다.
 * 음수 scalar는 음수 width/height인 empty rect를 만들 수 있다.
 * out과 rect가 같은 object여도 안전하다.
 *
 * @param out scale 결과 rect를 기록할 writable output
 * @param rect scale할 rect
 * @param scalar 곱할 배율
 */
export function scaleInto<Out extends RectWritable>(out: Out, rect: RectLike, scalar: number): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const x = readRectX(rect) * scalar;
  const y = readRectY(rect) * scalar;
  const w = readRectWidth(rect) * scalar;
  const h = readRectHeight(rect) * scalar;
  out.x = x;
  out.y = y;
  out.width = w;
  out.height = h;
  return out;
}
