import type { XYInput, XYObjectWritable } from '../types';
import { copyInto } from './copy-into';

/**
 * input의 x, y를 복사한 새 object를 반환한다.
 *
 * @param input 복사할 입력 벡터
 */
export function vecFrom(input: XYInput): XYObjectWritable {
  return copyInto({ x: 0, y: 0 }, input);
}
