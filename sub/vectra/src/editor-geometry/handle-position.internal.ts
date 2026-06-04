/**
 * handle / anchor 좌표 계산 internal helper.
 *
 * resizeHandlesInto, rotateHandlesInto, anchorPointInto, anchorPoint와
 * 향후 transformFromHandlesInto가 공유하는 순수 수치 계산만 담는다.
 *
 * 호출자가 보장해야 하는 전제:
 * - bounds는 정규화된 AABB (min ≤ max). inverted bounds 시 동작은 보장하지 않는다.
 * - NaN/Infinity 좌표는 IEEE-754 propagation으로 그대로 전달된다.
 */

import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY } from '../internal/xy';
import type { BoundsLike } from '../types';
import type { AnchorKind, ResizeHandleId } from './types';

// ---------------------------------------------------------------------------
// bounds 좌표 추출
// ---------------------------------------------------------------------------

/**
 * BoundsLike에서 min/max x/y 좌표를 추출해 반환한다.
 *
 * @param bounds 좌표를 추출할 bounds 입력
 */
export function readBoundsCoords(bounds: BoundsLike): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  midX: number;
  midY: number;
} {
  const min = readBoundsMin(bounds);
  const max = readBoundsMax(bounds);
  const minX = readX(min);
  const minY = readY(min);
  const maxX = readX(max);
  const maxY = readY(max);
  return {
    minX,
    minY,
    maxX,
    maxY,
    midX: (minX + maxX) / 2,
    midY: (minY + maxY) / 2,
  };
}

// ---------------------------------------------------------------------------
// resize handle 좌표
// ---------------------------------------------------------------------------

/** resize handle id 8개의 고정 순서. clockwise from top-left. */
export const RESIZE_HANDLE_ORDER: readonly ResizeHandleId[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

/**
 * resize handle id에 해당하는 x 좌표를 반환한다.
 *
 * @param id resize handle 식별자
 * @param minX bounds 최솟값 x
 * @param maxX bounds 최댓값 x
 * @param midX bounds x 중심
 */
export function resizeHandleX(id: ResizeHandleId, minX: number, maxX: number, midX: number): number {
  switch (id) {
    case 'nw':
    case 'sw':
    case 'w':
      return minX;
    case 'ne':
    case 'se':
    case 'e':
      return maxX;
    default:
      // 'n', 's'
      return midX;
  }
}

/**
 * resize handle id에 해당하는 y 좌표를 반환한다.
 *
 * @param id resize handle 식별자
 * @param minY bounds 최솟값 y
 * @param maxY bounds 최댓값 y
 * @param midY bounds y 중심
 */
export function resizeHandleY(id: ResizeHandleId, minY: number, maxY: number, midY: number): number {
  switch (id) {
    case 'nw':
    case 'n':
    case 'ne':
      return minY;
    case 'sw':
    case 's':
    case 'se':
      return maxY;
    default:
      // 'e', 'w'
      return midY;
  }
}

// ---------------------------------------------------------------------------
// anchor 좌표
// ---------------------------------------------------------------------------

/**
 * anchor kind에 해당하는 x 좌표를 반환한다.
 *
 * @param anchor 9-point anchor 식별자
 * @param minX bounds 최솟값 x
 * @param maxX bounds 최댓값 x
 * @param midX bounds x 중심
 */
export function anchorX(anchor: AnchorKind, minX: number, maxX: number, midX: number): number {
  switch (anchor) {
    case 'top-left':
    case 'left':
    case 'bottom-left':
      return minX;
    case 'top-right':
    case 'right':
    case 'bottom-right':
      return maxX;
    default:
      // 'top', 'center', 'bottom'
      return midX;
  }
}

/**
 * anchor kind에 해당하는 y 좌표를 반환한다.
 *
 * @param anchor 9-point anchor 식별자
 * @param minY bounds 최솟값 y
 * @param maxY bounds 최댓값 y
 * @param midY bounds y 중심
 */
export function anchorY(anchor: AnchorKind, minY: number, maxY: number, midY: number): number {
  switch (anchor) {
    case 'top-left':
    case 'top':
    case 'top-right':
      return minY;
    case 'bottom-left':
    case 'bottom':
    case 'bottom-right':
      return maxY;
    default:
      // 'left', 'center', 'right'
      return midY;
  }
}
