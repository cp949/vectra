import type { XYInput, XYObjectWritable } from '../types';
import { normalizeInto } from './normalize-into';

/**
 * input 벡터를 정규화한 새 object를 반환한다.
 *
 * zero vector 입력은 { x: 0, y: 0 }을 반환하고 throw하지 않는다.
 *
 * @param input 정규화할 입력 벡터
 */
export function normalize(input: XYInput): XYObjectWritable {
  return normalizeInto({ x: 0, y: 0 }, input);
}
