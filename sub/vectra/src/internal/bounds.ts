import type { BoundsLike, BoundsTuple, XYInput } from '../types';

function isBoundsTuple(bounds: BoundsLike): bounds is BoundsTuple {
  return Array.isArray(bounds);
}

/** bounds input에서 최솟값 corner를 읽는다. */
export function readBoundsMin(bounds: BoundsLike): XYInput {
  return isBoundsTuple(bounds) ? bounds[0] : bounds.min;
}

/** bounds input에서 최댓값 corner를 읽는다. */
export function readBoundsMax(bounds: BoundsLike): XYInput {
  return isBoundsTuple(bounds) ? bounds[1] : bounds.max;
}

/**
 * point (px, py)가 axis-aligned bounds 안에 있는지 판정한다.
 *
 * closed boundary 정책. inverted bounds(min > max)는 false.
 *
 * @param minX bounds min x
 * @param minY bounds min y
 * @param maxX bounds max x
 * @param maxY bounds max y
 * @param px point x
 * @param py point y
 */
export function boundsContainsPointXY(
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  px: number,
  py: number
): boolean {
  if (maxX < minX || maxY < minY) return false;
  return px >= minX && px <= maxX && py >= minY && py <= maxY;
}
