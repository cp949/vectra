import { createLegacyBounds } from '../internal/bounds';
import type { BoundsWritable, PolylineLike } from '../types';
import { boundsInto } from './bounds-into';

/**
 * boundsInto의 allocating companion.
 *
 * empty polyline은 sentinel empty bounds인 min=(Infinity, Infinity), max=(-Infinity, -Infinity)를 반환한다.
 */
export function bounds(polyline: PolylineLike): BoundsWritable {
  const seed = createLegacyBounds();
  return boundsInto(seed, polyline);
}
