import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { writeXY } from '../internal/xy';
import type { BoundsWritable, RectLike } from '../types';

/**
 * rect extent를 bounds로 변환해 out에 기록한다.
 *
 * `min=(x,y)`, `max=(x+width,y+height)`를 기록한다.
 * out과 rect가 같은 storage를 공유해도 안전하다.
 *
 * @param out 변환 결과 bounds를 기록할 writable output
 * @param rect bounds로 변환할 rect
 */
export function toBoundsInto<Out extends BoundsWritable>(out: Out, rect: RectLike): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const x = readRectX(rect);
  const y = readRectY(rect);
  const w = readRectWidth(rect);
  const h = readRectHeight(rect);
  writeXY(out.min, x, y);
  writeXY(out.max, x + w, y + h);
  return out;
}
