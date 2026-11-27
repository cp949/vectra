import type { Point, PointWritable } from '../types/flat-shapes.internal';
import { negateInto } from './negate-into';

/**
 * input의 각 성분을 부정한 벡터를 새 object로 반환한다.
 *
 * @param input 부정할 입력 벡터
 */
export function negate(input: Point): PointWritable {
  return negateInto({ x: 0, y: 0 }, input);
}
