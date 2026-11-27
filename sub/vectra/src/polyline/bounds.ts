import { createZeroBounds } from '../internal/bounds';
import type { BoundsWritable, Polyline } from '../types/flat-shapes.internal';
import { boundsInto } from './bounds-into';

/**
 * boundsInto의 allocating companion.
 *
 * empty polyline은 sentinel empty bounds(`minX = minY = Infinity`, `maxX = maxY = -Infinity`)를 반환한다.
 */
export function bounds(polyline: Polyline): BoundsWritable {
  const seed = createZeroBounds();
  return boundsInto(seed, polyline);
}
