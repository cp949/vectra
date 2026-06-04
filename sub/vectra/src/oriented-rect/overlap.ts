import { overlapsOrientedRectFrames } from '../internal/oriented-rect-overlap';
import { readOrientedRectQueryFrame } from '../internal/oriented-rect-query';
import type { OrientedRectLike } from '../types';

/**
 * 두 oriented rect의 closed region이 겹치거나 접하면 true를 반환한다.
 *
 * separating axis theorem(SAT)으로 판정한다. 검사 axis는 두 rect의 local x/y axis 4개이며 axis
 * convention은 `xAxis=(cos, sin)`, `yAxis=(-sin, cos)`다. 각 axis에서 center projection 거리가
 * projection half extent 합 이하이면 그 axis에서 겹치고, 4개 axis가 모두 겹치면 true다. closed
 * boundary 포함이라 edge나 corner가 한 점에서만 닿아도 true다.
 *
 * `size.x <= 0 || size.y <= 0`인 empty oriented rect는 한쪽이라도 해당하면 항상 false다.
 * width/height가 0인 line-like rect를 overlap으로 보지 않는다. size 두 성분이나 angle이
 * non-finite이면 `RangeError`다. center 좌표 non-finite는 검증하지 않고 산술에 전파되며, center
 * projection이 `NaN`/무한대가 되어 비교가 false가 되므로 항상 false를 반환한다.
 *
 * @param a 겹침을 판정할 첫 oriented rect
 * @param b 겹침을 판정할 둘째 oriented rect
 */
export function overlap(a: OrientedRectLike, b: OrientedRectLike): boolean {
  return overlapsOrientedRectFrames(readOrientedRectQueryFrame(a), readOrientedRectQueryFrame(b));
}
