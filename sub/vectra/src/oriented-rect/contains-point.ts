import { orientedRectFrameContainsPoint } from '../internal/oriented-rect-point-relation';
import { readOrientedRectQueryFrame } from '../internal/oriented-rect-query';
import { readX, readY } from '../internal/xy';
import type { OrientedRectLike, XYInput } from '../types';

/**
 * point가 oriented rect의 closed boundary 안에 있는지 반환한다.
 *
 * point를 rect local-space로 변환한 뒤 `abs(localX) <= width/2 && abs(localY) <= height/2`로
 * 판정한다. local axis convention은 `xAxis=(cos, sin)`, `yAxis=(-sin, cos)`이며 inverse는
 * `localX = dx*cos + dy*sin`, `localY = -dx*sin + dy*cos`다. edge와 corner 위 point를 포함하는
 * closed boundary다.
 *
 * `size.x <= 0 || size.y <= 0`인 empty oriented rect는 항상 false다. size 두 성분이나 angle이
 * non-finite이면 `RangeError`다. center 또는 point 좌표 non-finite는 검증하지 않고 local 좌표
 * 산술에 전파되며, 그 결과 boundary 비교가 `NaN`/무한대로 false가 되어 항상 false를 반환한다.
 *
 * @param rect point를 포함하는지 검사할 oriented rect
 * @param point containment를 검사할 point
 */
export function containsPoint(rect: OrientedRectLike, point: XYInput): boolean {
  const frame = readOrientedRectQueryFrame(rect);
  return orientedRectFrameContainsPoint(frame, readX(point), readY(point));
}
