import { readRectHeight, readRectWidth } from '../internal/rect';
import { writeXY } from '../internal/xy';
import type { RectLike, XYWritable } from '../types';

/**
 * rect의 size를 out에 기록한다.
 *
 * width/height를 정규화하지 않고 그대로 기록한다.
 * out과 rect가 같은 storage를 공유해도 안전하다.
 *
 * @param out size를 x=width, y=height로 기록할 writable output
 * @param rect size를 읽을 rect
 */
export function sizeInto<Out extends XYWritable>(out: Out, rect: RectLike): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const w = readRectWidth(rect);
  const h = readRectHeight(rect);
  return writeXY(out, w, h);
}
