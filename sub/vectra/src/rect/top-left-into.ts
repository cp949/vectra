import { readRectX, readRectY } from '../internal/rect';
import { writeXY } from '../internal/xy';
import type { RectLike, XYWritable } from '../types';

/**
 * rect의 top-left corner를 out에 기록한다.
 *
 * out과 rect가 같은 storage를 공유해도 안전하다.
 *
 * @param out top-left 좌표를 기록할 writable output
 * @param rect top-left 좌표를 읽을 rect
 */
export function topLeftInto<Out extends XYWritable>(out: Out, rect: RectLike): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const x = readRectX(rect);
  const y = readRectY(rect);
  return writeXY(out, x, y);
}
