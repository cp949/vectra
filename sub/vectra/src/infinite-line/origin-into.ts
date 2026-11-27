import type { InfiniteLine, PointWritable } from '../types/flat-shapes.internal';

/** infinite-line의 origin point를 `out`에 기록하고 `out`을 반환한다. */
export function originInto<Out extends PointWritable>(out: Out, line: InfiniteLine): Out {
  const { ox, oy } = line;
  out.x = ox;
  out.y = oy;
  return out;
}
