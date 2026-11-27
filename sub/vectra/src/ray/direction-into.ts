import type { Ray, PointWritable } from '../types/flat-shapes.internal';

/** ray의 direction vector를 `out`에 기록하고 `out`을 반환한다. */
export function directionInto<Out extends PointWritable>(out: Out, ray: Ray): Out {
  const { dx, dy } = ray;
  out.x = dx;
  out.y = dy;
  return out;
}
