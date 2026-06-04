import type { TriangleLike, XYObjectWritable } from '../types';
import { incenterInto } from './incenter-into';

/**
 * incenterInto의 allocating companion.
 * triangle의 내심을 XYObjectWritable로 반환한다.
 * perimeter가 0이면 undefined를 반환한다.
 *
 *
 * tolerance/iteration option 정책은 `incenterInto`와 동일하다.
 * @param triangle 내심을 계산할 triangle
 */
export function incenter(triangle: TriangleLike): XYObjectWritable | undefined {
  const seed: XYObjectWritable = { x: 0, y: 0 };
  const result = incenterInto(seed, triangle);
  return result === false ? undefined : result;
}
