import { createZeroCircle } from '../internal/circle';
import type { CircleWritable, Triangle } from '../types/flat-shapes.internal';
import { incircleInto } from './incircle-into';

/**
 * incircleInto의 allocating companion.
 * triangle의 내접원을 CircleWritable로 반환한다.
 * perimeter가 0이면 undefined를 반환한다.
 *
 *
 * tolerance/iteration option 정책은 `incircleInto`와 동일하다.
 * @param triangle 내접원을 계산할 triangle
 */
export function incircle(triangle: Triangle): CircleWritable | undefined {
  const seed = createZeroCircle();
  const result = incircleInto(seed, triangle);
  return result === false ? undefined : result;
}
