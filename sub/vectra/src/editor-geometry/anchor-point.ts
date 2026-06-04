/**
 * anchorPoint — bounds의 anchor 좌표를 plain object로 반환한다.
 */

import type { BoundsLike } from '../types';
import { anchorX, anchorY, readBoundsCoords } from './handle-position.internal';
import type { AnchorKind } from './types';

/**
 * bounds의 anchor 좌표를 plain `{ x, y }` object로 반환한다.
 *
 * 현재 정책에서 항상 결과를 반환한다(NaN propagation 허용).
 * undefined 반환은 future degenerate 정책 확장을 위해 시그니처에 포함한다.
 * unrotated AABB 기준 좌표만 산출한다. rotation 합성은 caller 책임.
 * NaN/Infinity 좌표는 IEEE-754 propagation으로 그대로 반환한다.
 *
 * @param bounds 대상 unrotated AABB
 * @param anchor 9-point anchor 식별자
 * @returns anchor 좌표 object. 현재 정책에서 항상 정의됨.
 */
export function anchorPoint(bounds: BoundsLike, anchor: AnchorKind): { x: number; y: number } | undefined {
  const { minX, minY, maxX, maxY, midX, midY } = readBoundsCoords(bounds);
  return {
    x: anchorX(anchor, minX, maxX, midX),
    y: anchorY(anchor, minY, maxY, midY),
  };
}
