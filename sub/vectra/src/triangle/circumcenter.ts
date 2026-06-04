import type { TriangleLike, XYObjectWritable } from '../types';
import { circumcenterInto } from './circumcenter-into';

/**
 * circumcenterInto의 allocating companion.
 * triangle의 외심을 XYObjectWritable로 반환한다.
 * degenerate triangle이면 undefined를 반환한다.
 *
 *
 * finite/non-finite 입력과 결과 처리 정책은 `circumcenterInto`와 동일하다.
 * tolerance/iteration option 정책은 `circumcenterInto`와 동일하다.
 * @param triangle 외심을 계산할 triangle
 */
export function circumcenter(triangle: TriangleLike): XYObjectWritable | undefined {
  const seed: XYObjectWritable = { x: 0, y: 0 };
  const result = circumcenterInto(seed, triangle);
  return result === false ? undefined : result;
}
