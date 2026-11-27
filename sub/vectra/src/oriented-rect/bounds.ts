import { createZeroBounds } from '../internal/bounds';
import type { BoundsWritable, OrientedRect } from '../types/flat-shapes.internal';
import { boundsInto } from './bounds-into';

/**
 * oriented rect를 포함하는 axis-aligned bounds를 새 plain object로 반환한다.
 *
 * 회전된 corner의 min/max로 AABB를 구한다. `width <= 0 || height <= 0`인 empty oriented rect는
 * sentinel empty bounds(`min = (Infinity, Infinity)`, `max = (-Infinity, -Infinity)`)를 반환한다.
 * size 두 성분이나 angle이 non-finite이면 `RangeError`다. center 좌표 non-finite는 검증하지 않고
 * 산술 결과를 따른다.
 *
 * @param rect bounds로 변환할 oriented rect
 */
export function bounds(rect: OrientedRect): BoundsWritable {
  return boundsInto(createZeroBounds(), rect);
}
