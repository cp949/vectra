import type { Ray, PointWritable } from '../types/flat-shapes.internal';

/** ray의 origin point를 `out`에 기록하고 `out`을 반환한다. */
export function originInto<Out extends PointWritable>(out: Out, ray: Ray): Out {
  const { ox, oy } = ray;
  out.x = ox;
  out.y = oy;
  return out;
}
