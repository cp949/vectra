import type { EllipseWritable, Rect } from '../types/flat-shapes.internal';
import { createZeroEllipse } from '../internal/ellipse';
import { fromRectInto } from './from-rect-into';

/**
 * rect에서 ellipse를 생성해 새 plain object로 반환한다.
 *
 * center = (x + width/2, y + height/2), rx = width/2, ry = height/2.
 * width <= 0이면 rx = 0, height <= 0이면 ry = 0 (독립 적용).
 * center는 width/height 부호와 무관하게 항상 기록한다.
 *
 * @param rect ellipse를 생성할 rect
 */
export function fromRect(rect: Rect): EllipseWritable {
  return fromRectInto(createZeroEllipse(), rect);
}
