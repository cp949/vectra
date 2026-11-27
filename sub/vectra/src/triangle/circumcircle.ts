import { createZeroCircle } from '../internal/circle';
import type { CircleWritable, Triangle } from '../types/flat-shapes.internal';
import { circumcircleInto } from './circumcircle-into';

/**
 * circumcircleInto의 allocating companion.
 * triangle의 외접원을 CircleWritable로 반환한다.
 * degenerate triangle이면 undefined를 반환한다.
 *
 * @param triangle 외접원을 계산할 triangle
 */
export function circumcircle(triangle: Triangle): CircleWritable | undefined {
  const seed = createZeroCircle();
  const result = circumcircleInto(seed, triangle);
  return result === false ? undefined : result;
}
