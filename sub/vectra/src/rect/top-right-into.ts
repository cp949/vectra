import { readRectWidth, readRectX, readRectY } from '../internal/rect';
import { writeXY } from '../internal/xy';
import type { RectLike, XYWritable } from '../types';

/**
 * rect의 top-right corner를 out에 기록한다.
 *
 * width를 정규화하지 않고 `x + width`, `y`를 그대로 기록한다.
 * out과 rect가 같은 storage를 공유해도 안전하다.
 *
 * @param out top-right 좌표를 기록할 writable output
 * @param rect top-right 좌표를 읽을 rect
 */
export function topRightInto<Out extends XYWritable>(out: Out, rect: RectLike): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const x = readRectX(rect) + readRectWidth(rect);
  const y = readRectY(rect);
  return writeXY(out, x, y);
}
