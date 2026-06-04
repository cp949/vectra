import type { EllipseWritable, RectLike } from '../types';
import { createEllipse } from './create-ellipse';
import { fromRectInto } from './from-rect-into';

/**
 * rect에서 ellipse를 생성해 새 plain object로 반환한다.
 *
 * center = (x + width/2, y + height/2), radiusX = width/2, radiusY = height/2.
 * width <= 0이면 radiusX = 0, height <= 0이면 radiusY = 0 (독립 적용).
 * center는 width/height 부호와 무관하게 항상 기록한다.
 *
 * @param rect ellipse를 생성할 rect
 */
export function fromRect(rect: RectLike): EllipseWritable {
  return fromRectInto(createEllipse(), rect);
}
