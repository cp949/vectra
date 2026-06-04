import type { CircleLike, CircleTuple, XYInput } from '../types';

function isCircleTuple(circle: CircleLike): circle is CircleTuple {
  return Array.isArray(circle);
}

/** circle input에서 중심점을 읽는다. */
export function readCircleCenter(circle: CircleLike): XYInput {
  return isCircleTuple(circle) ? circle[0] : circle.center;
}

/** circle input에서 반지름을 읽는다. */
export function readCircleRadius(circle: CircleLike): number {
  return isCircleTuple(circle) ? circle[1] : circle.radius;
}
