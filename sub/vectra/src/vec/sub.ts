import type { XYInput, XYObjectWritable } from '../types';
import { subInto } from './sub-into';

/**
 * a에서 b를 뺀 벡터를 새 object로 반환한다.
 *
 * @param a 피감산 벡터
 * @param b 감산 벡터
 */
export function sub(a: XYInput, b: XYInput): XYObjectWritable {
  return subInto({ x: 0, y: 0 }, a, b);
}
