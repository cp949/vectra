import type { BoundsPaddingLike } from '../types';
import type { Bounds, BoundsWritable } from '../types/flat-shapes.internal';
import { createBounds } from './create-bounds';
import { expandBySidesInto } from './expand-by-sides-into';

/**
 * bounds를 top/right/bottom/left 개별 양만큼 확장한 결과를 새 plain bounds object로 반환한다.
 *
 * minX -= left, minY -= top, maxX += right, maxY += bottom.
 * 누락 field는 0으로 처리한다. 음수 값은 deflate로 동작하며 결과가 inverted이면 empty bounds가 된다.
 * sentinel/empty bounds에도 raw 산식을 그대로 적용한다.
 *
 * @param bounds 확장할 기준 bounds
 * @param padding 각 방향 확장량. 미지정 field는 0
 */
export function expandBySides(bounds: Bounds, padding: BoundsPaddingLike): BoundsWritable {
  return expandBySidesInto(createBounds(), bounds, padding);
}
