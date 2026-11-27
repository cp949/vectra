import type { InfiniteLine, PointWritable } from '../types/flat-shapes.internal';

/** infinite-line의 direction vector를 `out`에 기록하고 `out`을 반환한다. */
export function directionInto<Out extends PointWritable>(out: Out, line: InfiniteLine): Out {
  const { dx, dy } = line;
  out.x = dx;
  out.y = dy;
  return out;
}
