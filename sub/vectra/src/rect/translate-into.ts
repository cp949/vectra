import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { readX, readY } from '../internal/xy';
import type { RectLike, RectWritable, XYInput } from '../types';

/**
 * rect를 offset만큼 이동한 결과를 out에 기록한다.
 *
 * width/height는 그대로 보존한다.
 * out과 rect 또는 offset이 같은 storage를 공유해도 안전하다.
 *
 * @param out 이동한 rect를 기록할 writable output
 * @param rect 이동할 rect
 * @param offset x/y에 더할 offset
 */
export function translateInto<Out extends RectWritable>(out: Out, rect: RectLike, offset: XYInput): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const x = readRectX(rect) + readX(offset);
  const y = readRectY(rect) + readY(offset);
  const w = readRectWidth(rect);
  const h = readRectHeight(rect);
  out.x = x;
  out.y = y;
  out.width = w;
  out.height = h;
  return out;
}
