import { createZeroCircle } from '../internal/circle';
import type { CircleWritable, Triangle } from '../types/flat-shapes.internal';
import { ninePointCircleInto } from './nine-point-circle-into';

/**
 * ninePointCircleInto의 allocating companion.
 * triangle의 nine-point circle(구점원)을 CircleWritable로 반환한다.
 *
 * 중심은 외심(circumcenter)과 수심(orthocenter)의 중점이고, 반지름은 외접원 반지름의 절반이다.
 * degenerate triangle(collinear 또는 non-finite vertex)이면 undefined를 반환한다.
 *
 * @param triangle nine-point circle을 계산할 triangle
 */
export function ninePointCircle(triangle: Triangle): CircleWritable | undefined {
  const seed = createZeroCircle();
  const result = ninePointCircleInto(seed, triangle);
  return result === false ? undefined : result;
}
