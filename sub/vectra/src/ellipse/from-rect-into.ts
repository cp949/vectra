import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { writeXY } from '../internal/xy';
import type { EllipseWritable, RectLike, XYWritable } from '../types';

/**
 * rect에서 ellipse를 생성해 out에 기록하고 out을 반환한다.
 *
 * center = (x + width/2, y + height/2), radiusX = width/2, radiusY = height/2.
 * width <= 0이면 radiusX = 0, height <= 0이면 radiusY = 0 (독립 적용).
 * center는 width/height 부호와 무관하게 항상 기록한다.
 *
 * @param out ellipse를 기록할 writable output
 * @param rect ellipse를 생성할 rect
 */
export function fromRectInto<Out extends EllipseWritable<XYWritable>>(out: Out, rect: RectLike): Out {
  const x = readRectX(rect);
  const y = readRectY(rect);
  const w = readRectWidth(rect);
  const h = readRectHeight(rect);

  writeXY(out.center, x + w * 0.5, y + h * 0.5);
  out.radiusX = w <= 0 ? 0 : w * 0.5;
  out.radiusY = h <= 0 ? 0 : h * 0.5;
  return out;
}
