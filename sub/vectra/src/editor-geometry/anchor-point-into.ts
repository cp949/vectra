/**
 * anchorPointInto — bounds의 anchor 좌표를 out에 기록한다.
 */

import { writeXY } from '../internal/xy';
import type { BoundsLike, XYWritable } from '../types';
import { anchorX, anchorY, readBoundsCoords } from './handle-position.internal';
import type { AnchorKind } from './types';

/**
 * bounds의 anchor 좌표를 out에 기록한다.
 *
 * 성공 시 true 반환. 현재 정책에서는 항상 성공한다(NaN propagation 허용).
 * boolean-primary로 시그니처를 통일해 future degenerate 정책 확장 여지를 둔다.
 * unrotated AABB 기준 좌표만 산출한다. rotation 합성은 caller 책임.
 * NaN/Infinity 좌표는 IEEE-754 propagation으로 그대로 기록한다.
 *
 * @param out anchor 좌표를 기록할 caller-side writable point
 * @param bounds 대상 unrotated AABB
 * @param anchor 9-point anchor 식별자
 * @returns 항상 true (현재 정책)
 */
export function anchorPointInto<Out extends XYWritable>(out: Out, bounds: BoundsLike, anchor: AnchorKind): boolean {
  const { minX, minY, maxX, maxY, midX, midY } = readBoundsCoords(bounds);
  writeXY(out, anchorX(anchor, minX, maxX, midX), anchorY(anchor, minY, maxY, midY));
  return true;
}
