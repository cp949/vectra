import { createBounds } from '../bounds/create-bounds';
import type { BoundsWritable, CenterArcLike } from '../types';
import { arcBoundsInto } from './arc-bounds-into';

/**
 * center form arc의 axis-aligned bounding box를 새 object로 반환한다.
 *
 * `arcBoundsInto`의 allocating companion. 결과는 새 plain `{ min: {x, y}, max: {x, y} }`이다.
 *
 * endpoint(t=0, t=1)와 sweep 범위 안에 있는 rotated ellipse axis-extremum을 모두 후보로 두고
 * min/max를 계산한다. degenerate(rx==0 또는 ry==0) arc는 (cx, cy)에 위치한 점 bounds를 반환한다.
 *
 * @param centerArc center form arc input
 * @returns 새 plain bounds object
 */
export function arcBounds(centerArc: CenterArcLike): BoundsWritable {
  return arcBoundsInto(createBounds(), centerArc);
}
