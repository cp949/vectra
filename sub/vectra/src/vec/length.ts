import type { Point } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * input 벡터의 Euclidean 길이를 반환한다.
 *
 * @param input 길이를 측정할 벡터
 */
export function length(input: Point): number {
  return hypot2(input.x, input.y);
}
