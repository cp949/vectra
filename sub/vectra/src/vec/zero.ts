import type { XYObjectWritable } from '../types';
import { zeroInto } from './zero-into';

/**
 * (0, 0) 벡터를 새 object로 반환한다.
 */
export function zero(): XYObjectWritable {
  return zeroInto({ x: 0, y: 0 });
}
