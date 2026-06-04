import type { XYInput, XYObjectWritable } from '../types';
import { ceilInto } from './ceil-into';

/**
 * input의 각 성분을 올림한 벡터를 새 object로 반환한다.
 *
 * NaN, Infinity, -Infinity 입력은 그대로 통과된다.
 *
 * @param input 올림할 입력 벡터
 */
export function ceil(input: XYInput): XYObjectWritable {
  return ceilInto({ x: 0, y: 0 }, input);
}
