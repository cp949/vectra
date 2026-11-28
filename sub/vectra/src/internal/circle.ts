import type { CircleWritable } from '../types/flat-shapes.internal';

/** 중심과 반지름이 0인 원을 생성한다. */
export function createZeroCircle(): CircleWritable {
  return { cx: 0, cy: 0, r: 0 };
}
