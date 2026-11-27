import type { Rect, RectWritable } from '../types/flat-shapes.internal';
import { copyInto } from './copy-into';
import { createRect } from './create-rect';

/**
 * `Rect` source의 component를 새 plain object로 복사해 반환한다.
 *
 * width/height를 정규화하지 않고 입력값 그대로 기록한다.
 *
 * @param rect 복사할 source rect
 */
export function rectFrom(rect: Rect): RectWritable {
  return copyInto(createRect(), rect);
}
