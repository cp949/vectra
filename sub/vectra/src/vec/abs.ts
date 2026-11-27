import type { Point, PointWritable } from '../types/flat-shapes.internal';
import { absInto } from './abs-into';

/**
 * input의 각 성분의 절댓값으로 구성된 벡터를 새 object로 반환한다.
 *
 * @param input 절댓값을 취할 입력 벡터
 */
export function abs(input: Point): PointWritable {
  return absInto({ x: 0, y: 0 }, input);
}
