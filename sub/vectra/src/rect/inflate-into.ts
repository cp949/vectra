import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import type { RectLike, RectWritable } from '../types';

/**
 * rect를 amount만큼 사방으로 inflate한 결과를 out에 기록한다.
 *
 * `x -= amount`, `y -= amount`, `width += 2 * amount`, `height += 2 * amount`를 적용한다.
 * 음수 amount는 deflate로 동작하며 결과 width/height가 음수가 될 수 있다.
 * out과 rect가 같은 object여도 안전하다.
 *
 * @param out inflate 결과 rect를 기록할 writable output
 * @param rect inflate할 rect
 * @param amount 각 방향으로 확장할 거리
 */
export function inflateInto<Out extends RectWritable>(out: Out, rect: RectLike, amount: number): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const x = readRectX(rect) - amount;
  const y = readRectY(rect) - amount;
  const w = readRectWidth(rect) + 2 * amount;
  const h = readRectHeight(rect) + 2 * amount;
  out.x = x;
  out.y = y;
  out.width = w;
  out.height = h;
  return out;
}
