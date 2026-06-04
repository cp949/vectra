import type { CircleWritable, TriangleLike, XYObjectWritable } from '../types';
import { ninePointCircleInto } from './nine-point-circle-into';

/**
 * ninePointCircleInto의 allocating companion.
 * triangle의 nine-point circle(구점원)을 CircleWritable<XYObjectWritable>로 반환한다.
 *
 * 중심은 외심(circumcenter)과 수심(orthocenter)의 중점이고, 반지름은 외접원 반지름의 절반이다.
 * degenerate triangle(collinear 또는 non-finite vertex)이면 undefined를 반환한다.
 *
 * @param triangle nine-point circle을 계산할 triangle
 */
export function ninePointCircle(triangle: TriangleLike): CircleWritable<XYObjectWritable> | undefined {
  const seed: CircleWritable<XYObjectWritable> = { center: { x: 0, y: 0 }, radius: 0 };
  const result = ninePointCircleInto(seed, triangle);
  return result === false ? undefined : result;
}
