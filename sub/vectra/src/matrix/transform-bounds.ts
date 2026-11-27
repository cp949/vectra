import { createZeroBounds } from '../internal/bounds';
import type { Bounds, BoundsWritable, Matrix } from '../types/flat-shapes.internal';
import { transformBoundsInto } from './transform-bounds-into';

/**
 * bounds의 네 corner를 matrix로 변환한 AABB를 새 plain bounds로 반환한다.
 *
 * empty bounds는 sentinel empty bounds를 반환한다.
 *
 * @param matrix bounds corner에 적용할 matrix
 * @param bounds 변환할 bounds
 */
export function transformBounds(matrix: Matrix, bounds: Bounds): BoundsWritable {
  return transformBoundsInto(createZeroBounds(), matrix, bounds);
}
