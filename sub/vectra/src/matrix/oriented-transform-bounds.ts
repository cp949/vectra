import type { BoundsLike, MatrixLike, OrientedBoundsWritable } from '../types';
import { orientedTransformBoundsInto } from './oriented-transform-bounds-into';

/**
 * bounds의 네 corner를 matrix로 변환한 oriented outline을 새 plain object로 반환한다.
 *
 * AABB로 감싸지 않고 변환된 네 corner 좌표를 그대로 기록한다. corner 순서는
 * `topLeft`(minX, minY) → `topRight`(maxX, minY) → `bottomRight`(maxX, maxY) → `bottomLeft`(minX, maxY).
 * `orientedTransformBoundsInto`의 allocating companion이다.
 *
 * empty sentinel bounds는 네 corner를 한 점으로 축퇴 기록한다. finite inverted bounds는 `min` corner를
 * 변환하고, canonical/non-finite empty sentinel은 origin을 변환한다. non-finite matrix/bounds component는
 * 검증하지 않고 산술 결과를 그대로 기록한다 (caller 책임).
 *
 * @param matrix bounds corner에 적용할 matrix
 * @param bounds 변환할 bounds
 */
export function orientedTransformBounds(matrix: MatrixLike, bounds: BoundsLike): OrientedBoundsWritable {
  return orientedTransformBoundsInto(
    {
      topLeft: { x: 0, y: 0 },
      topRight: { x: 0, y: 0 },
      bottomRight: { x: 0, y: 0 },
      bottomLeft: { x: 0, y: 0 },
    },
    matrix,
    bounds
  );
}
