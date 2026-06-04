import type { XYObjectWritable } from '../types';
import { oneInto } from './one-into';

/**
 * (1, 1) 벡터를 새 object로 반환한다.
 */
export function one(): XYObjectWritable {
  return oneInto({ x: 0, y: 0 });
}
