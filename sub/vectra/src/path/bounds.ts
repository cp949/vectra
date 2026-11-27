import { createZeroBounds } from '../internal/bounds';
import type { BoundsWritable } from '../types/flat-shapes.internal';
import type { PathCommand, PathMeasurementOptions } from '../types/index';
import { boundsInto } from './bounds-into';

/**
 * commands의 bounding box를 새 plain bounds object로 반환한다.
 *
 * `boundsInto`의 allocating companion이다.
 * empty path → sentinel bounds { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity } 반환.
 *
 * @param commands bounds를 계산할 path command sequence
 * @param options adaptive subdivision option (exact bounds 사용이므로 미활용)
 */
export function bounds(commands: readonly PathCommand[], options?: PathMeasurementOptions): BoundsWritable {
  return boundsInto(createZeroBounds(), commands, options);
}
