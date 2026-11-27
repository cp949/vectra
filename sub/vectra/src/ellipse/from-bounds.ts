import type { Bounds, EllipseWritable } from '../types/flat-shapes.internal';
import { createZeroEllipse } from '../internal/ellipse';
import { fromBoundsInto } from './from-bounds-into';

/**
 * bounds에서 ellipse를 생성해 새 plain object로 반환한다.
 *
 * center = bounds 중심, rx = width/2, ry = height/2.
 * empty bounds(maxX < minX || maxY < minY)이면 rx = 0, ry = 0,
 * center에 (minX, minY)를 전파한다.
 *
 * @param bounds ellipse를 생성할 bounds
 */
export function fromBounds(bounds: Bounds): EllipseWritable {
  return fromBoundsInto(createZeroEllipse(), bounds);
}
