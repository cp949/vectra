import type { XYInput, XYObjectWritable } from '../types';
import { addInto } from './add-into';

/**
 * a와 b를 더한 벡터를 새 object로 반환한다.
 *
 * @param a 더할 첫 번째 벡터
 * @param b 더할 두 번째 벡터
 */
export function add(a: XYInput, b: XYInput): XYObjectWritable {
  return addInto({ x: 0, y: 0 }, a, b);
}
