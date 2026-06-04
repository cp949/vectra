import type { CircleLike, RectLike, XYObjectWritable } from '../types';
import { circleRectClosestPointInto } from './circle-rect-closest-point-into';

/**
 * circle center와 rect area 사이의 closest point를 새 object로 반환한다.
 *
 * center가 rect 밖이면 rect로 axis clamp한 point, rect boundary 위면 그 point, rect 내부면 가장 가까운
 * boundary point를 반환한다. closest point는 항상 rect 위 또는 내부다. radius는 입력 validation에만 쓰고
 * 결과 point에는 반영하지 않는다(반지름 offset closest pair나 penetration point를 만들지 않는다).
 * 내부 center의 boundary tie는 left, right, top, bottom 순서로 deterministic하게 고정한다(같은 거리면 앞쪽 우선).
 * empty rect(width ≤ 0 또는 height ≤ 0), non-finite rect, non-finite circle center, negative/non-finite radius는
 * `undefined`를 반환한다. allocating companion — 매 호출 새 `{ x, y }` object를 만든다.
 *
 * @param circle closest point 기준 circle. center만 위치 계산에 쓰고 radius는 validation에만 쓴다
 * @param rect closest point 대상 rect (axis-aligned)
 */
export function circleRectClosestPoint(circle: CircleLike, rect: RectLike): XYObjectWritable | undefined {
  const out: XYObjectWritable = { x: 0, y: 0 };
  return circleRectClosestPointInto(out, circle, rect) ? out : undefined;
}
