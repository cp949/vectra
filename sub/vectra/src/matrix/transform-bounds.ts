import { createBounds } from '../bounds/create-bounds';
import type { BoundsLike, BoundsWritable, MatrixLike } from '../types';
import { transformBoundsInto } from './transform-bounds-into';

/**
 * bounds의 네 corner를 matrix로 변환한 AABB를 새 plain bounds로 반환한다.
 *
 * empty bounds는 sentinel empty bounds를 반환한다.
 *
 * @param matrix bounds corner에 적용할 matrix
 * @param bounds 변환할 bounds
 */
export function transformBounds(matrix: MatrixLike, bounds: BoundsLike): BoundsWritable {
  return transformBoundsInto(createBounds(), matrix, bounds);
}
