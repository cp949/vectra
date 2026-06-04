import type { XYInput, XYObjectWritable } from '../types';
import { floorInto } from './floor-into';

/**
 * input의 각 성분을 내림한 벡터를 새 object로 반환한다.
 *
 * NaN, Infinity, -Infinity 입력은 그대로 통과된다.
 *
 * @param input 내림할 입력 벡터
 */
export function floor(input: XYInput): XYObjectWritable {
  return floorInto({ x: 0, y: 0 }, input);
}
