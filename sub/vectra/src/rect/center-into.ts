import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { writeXY } from '../internal/xy';
import type { RectLike, XYWritable } from '../types';

/**
 * rect의 center 좌표를 out에 기록한다.
 *
 * empty rect도 raw 산식 `x + width / 2`, `y + height / 2`를 그대로 사용한다.
 * out과 rect가 같은 storage를 공유해도 안전하다.
 *
 * @param out center 좌표를 기록할 writable output
 * @param rect center 좌표를 읽을 rect
 */
export function centerInto<Out extends XYWritable>(out: Out, rect: RectLike): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const cx = readRectX(rect) + readRectWidth(rect) / 2;
  const cy = readRectY(rect) + readRectHeight(rect) / 2;
  return writeXY(out, cx, cy);
}
