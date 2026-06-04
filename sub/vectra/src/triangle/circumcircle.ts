import type { CircleWritable, TriangleLike, XYObjectWritable } from '../types';
import { circumcircleInto } from './circumcircle-into';

/**
 * circumcircleInto의 allocating companion.
 * triangle의 외접원을 CircleWritable<XYObjectWritable>로 반환한다.
 * degenerate triangle이면 undefined를 반환한다.
 *
 * @param triangle 외접원을 계산할 triangle
 */
export function circumcircle(triangle: TriangleLike): CircleWritable<XYObjectWritable> | undefined {
  const seed: CircleWritable<XYObjectWritable> = { center: { x: 0, y: 0 }, radius: 0 };
  const result = circumcircleInto(seed, triangle);
  return result === false ? undefined : result;
}
