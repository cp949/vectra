import { createBounds } from '../bounds/create-bounds';
import type { BoundsWritable, EllipseLike } from '../types';
import { boundsInto } from './bounds-into';

/**
 * ellipse를 포함하는 axis-aligned bounds를 새 plain object로 반환한다.
 *
 * min = (cx - rx, cy - ry), max = (cx + rx, cy + ry).
 * empty ellipse(radiusX <= 0 || radiusY <= 0)이면 sentinel empty bounds를 반환한다.
 *
 * @param ellipse bounds로 변환할 ellipse
 */
export function bounds(ellipse: EllipseLike): BoundsWritable {
  return boundsInto(createBounds(), ellipse);
}
