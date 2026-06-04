import type { BoundsLike, EllipseWritable } from '../types';
import { createEllipse } from './create-ellipse';
import { fromBoundsInto } from './from-bounds-into';

/**
 * bounds에서 ellipse를 생성해 새 plain object로 반환한다.
 *
 * center = bounds 중심, radiusX = width/2, radiusY = height/2.
 * empty bounds(max.x < min.x || max.y < min.y)이면 radiusX = 0, radiusY = 0,
 * center에 (min.x, min.y)를 전파한다.
 *
 * @param bounds ellipse를 생성할 bounds
 */
export function fromBounds(bounds: BoundsLike): EllipseWritable {
  return fromBoundsInto(createEllipse(), bounds);
}
