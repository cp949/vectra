/**
 * resizeHandles — bounds의 8개 resize handle 좌표 collection을 새 배열로 반환하는 companion.
 */

import type { BoundsLike, XYObjectWritable } from '../types';
import { resizeHandlesInto } from './resize-handles-into';
import type { HandlePoint } from './types';

/**
 * bounds의 8개 resize handle 좌표 collection을 새 배열로 반환한다.
 *
 * `resizeHandlesInto`의 allocating companion이다. default factory가 handle마다 새 plain
 * `{ x, y }` object를 만든다(같은 point object를 재사용하지 않는다).
 * ordering: 'nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w' (clockwise from top-left).
 * unrotated AABB 기준 좌표만 산출한다. rotation 합성은 caller 책임.
 * width/height = 0인 degenerate bounds에서도 8개를 반환한다(좌표는 동일점).
 * NaN/Infinity 좌표는 IEEE-754 propagation으로 그대로 담는다.
 * 호출마다 새 배열을 반환한다.
 *
 * @param bounds 대상 unrotated AABB
 * @returns handle 좌표 배열 (항상 8개)
 */
export function resizeHandles(bounds: BoundsLike): HandlePoint<XYObjectWritable>[] {
  const out: HandlePoint<XYObjectWritable>[] = [];
  resizeHandlesInto(out, bounds, () => ({ x: 0, y: 0 }));
  return out;
}
