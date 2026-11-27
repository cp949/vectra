import type { PointWritable } from '../types/flat-shapes.internal';
import { oneInto } from './one-into';

/**
 * (1, 1) 벡터를 새 object로 반환한다.
 */
export function one(): PointWritable {
  return oneInto({ x: 0, y: 0 });
}
