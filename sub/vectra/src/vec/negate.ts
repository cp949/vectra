import type { XYInput, XYObjectWritable } from '../types';
import { negateInto } from './negate-into';

/**
 * input의 각 성분을 부정한 벡터를 새 object로 반환한다.
 *
 * @param input 부정할 입력 벡터
 */
export function negate(input: XYInput): XYObjectWritable {
  return negateInto({ x: 0, y: 0 }, input);
}
