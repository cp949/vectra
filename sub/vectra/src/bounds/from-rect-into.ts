import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { writeXY } from '../internal/xy';
import type { BoundsWritable, RectLike } from '../types';

/**
 * rect의 extent를 bounds로 변환해 out에 기록한다.
 *
 * rect의 x/y를 min으로, x + width와 y + height를 max로 기록한다. line/point rect는
 * line/point bounds가 되어 bounds 기준으로는 non-empty가 된다.
 *
 * @param out 변환된 bounds를 기록할 writable output
 * @param rect bounds로 변환할 rect
 */
export function fromRectInto<Out extends BoundsWritable>(out: Out, rect: RectLike): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const x = readRectX(rect);
  const y = readRectY(rect);
  const w = readRectWidth(rect);
  const h = readRectHeight(rect);
  writeXY(out.min, x, y);
  writeXY(out.max, x + w, y + h);
  return out;
}
