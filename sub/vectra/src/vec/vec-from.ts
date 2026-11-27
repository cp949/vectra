import { readX, readY } from '../internal/xy';
import type { XYInput, XYObjectWritable } from '../types';
import { copyInto } from './copy-into';

/**
 * input의 x, y를 복사한 새 object를 반환한다.
 *
 * @param input 복사할 입력 벡터
 */
export function vecFrom(input: XYInput): XYObjectWritable {
  // v2-migration: vecFrom의 tuple 입력을 점 객체로 변환한다.
  return copyInto({ x: 0, y: 0 }, { x: readX(input), y: readY(input) });
}
