/**
 * anchorPointInto — bounds의 anchor 좌표를 out에 기록한다.
 */

import type { Bounds, PointWritable } from '../types/flat-shapes.internal';
import { anchorX, anchorY, boundsWithMidpoint } from './handle-position.internal';
import type { AnchorKind } from './types';

/**
 * bounds의 anchor 좌표를 out에 기록한다.
 *
 * 성공 시 true 반환. 현재 정책에서는 항상 성공한다(NaN propagation 허용).
 * boolean-primary로 시그니처를 통일해 future degenerate 정책 확장 여지를 둔다.
 * unrotated AABB 기준 좌표만 산출한다. rotation 합성은 caller 책임.
 * NaN/Infinity 좌표는 IEEE-754 propagation으로 그대로 기록한다.
 *
 * @param out 결과 좌표를 기록할 출력 { x, y }
 * @param bounds 대상 unrotated AABB
 * @param anchor 9-point anchor 식별자
 * @returns 항상 true (현재 정책)
 */
export function anchorPointInto(out: PointWritable, bounds: Bounds, anchor: AnchorKind): boolean {
  const { minX, minY, maxX, maxY, midX, midY } = boundsWithMidpoint(bounds);
  out.x = anchorX(anchor, minX, maxX, midX);
  out.y = anchorY(anchor, minY, maxY, midY);
  return true;
}
