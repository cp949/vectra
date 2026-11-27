import type { Triangle, PointWritable } from '../types/flat-shapes.internal';
import { orthocenterInto } from './orthocenter-into';

/**
 * orthocenterInto의 allocating companion.
 * triangle의 수심을 XYObjectWritable로 반환한다.
 * degenerate triangle이면 undefined를 반환한다.
 *
 *
 * finite/non-finite 입력과 결과 처리 정책은 `orthocenterInto`와 동일하다.
 * tolerance/iteration option 정책은 `orthocenterInto`와 동일하다.
 * @param triangle 수심을 계산할 triangle
 */
export function orthocenter(triangle: Triangle): PointWritable | undefined {
  const seed: PointWritable = { x: 0, y: 0 };
  const result = orthocenterInto(seed, triangle);
  return result === false ? undefined : result;
}
