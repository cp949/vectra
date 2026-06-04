import type { CircleWritable, TriangleLike, XYObjectWritable } from '../types';
import { incircleInto } from './incircle-into';

/**
 * incircleInto의 allocating companion.
 * triangle의 내접원을 CircleWritable<XYObjectWritable>로 반환한다.
 * perimeter가 0이면 undefined를 반환한다.
 *
 *
 * tolerance/iteration option 정책은 `incircleInto`와 동일하다.
 * @param triangle 내접원을 계산할 triangle
 */
export function incircle(triangle: TriangleLike): CircleWritable<XYObjectWritable> | undefined {
  const seed: CircleWritable<XYObjectWritable> = { center: { x: 0, y: 0 }, radius: 0 };
  const result = incircleInto(seed, triangle);
  return result === false ? undefined : result;
}
