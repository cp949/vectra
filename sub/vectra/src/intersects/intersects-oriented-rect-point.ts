import { orientedRectFrameContainsPoint } from '../internal/oriented-rect-point-relation';
import { readOrientedRectQueryFrame } from '../internal/oriented-rect-query';
import { readX, readY } from '../internal/xy';
import type { OrientedRectLike, XYInput } from '../types';

/**
 * point가 oriented rect의 closed region 안이나 boundary 위에 있으면 true를 반환한다.
 *
 * `intersects` owner가 제공하는 oriented-rect × point relation이다. `oriented-rect/containsPoint`와
 * 같은 closed-boundary point containment를 판정한다. point를 rect local-space로 변환한 뒤
 * `abs(localX) <= width/2 && abs(localY) <= height/2`로 판정하며 edge와 corner 위 point를 포함한다.
 *
 * `size.x <= 0 || size.y <= 0`인 empty oriented rect는 항상 false다. size 두 성분이나 angle이
 * non-finite이면 `RangeError`다. center 또는 point 좌표 non-finite는 검증하지 않고 local 좌표
 * 산술에 전파되며, boundary 비교가 `NaN`/무한대로 false가 되어 항상 false를 반환한다.
 *
 * @param rect point와의 교차를 판정할 oriented rect
 * @param point oriented rect와 교차하는지 판정할 point
 */
export function intersectsOrientedRectPoint(rect: OrientedRectLike, point: XYInput): boolean {
  const frame = readOrientedRectQueryFrame(rect);
  return orientedRectFrameContainsPoint(frame, readX(point), readY(point));
}
