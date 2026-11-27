import type { CircleLike, CircleTuple, XYInput } from '../types';
import type { CircleWritable } from '../types/flat-shapes.internal';

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

/** 중심과 반지름이 0인 원을 생성한다. */
export function createZeroCircle(): CircleWritable {
  return { cx: 0, cy: 0, r: 0 };
}
