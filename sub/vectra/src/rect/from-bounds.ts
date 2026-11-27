import type { Bounds, RectWritable } from '../types/flat-shapes.internal';
import { createRect } from './create-rect';
import { fromBoundsInto } from './from-bounds-into';

/**
 * bounds extent를 새 plain rect로 반환한다.
 *
 * `x=minX`, `y=minY`, `width=maxX-minX`, `height=maxY-minY`를 기록한다.
 *
 * @param bounds rect로 변환할 bounds
 */
export function fromBounds(bounds: Bounds): RectWritable {
  return fromBoundsInto(createRect(), bounds);
}
