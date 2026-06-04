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
