import type { SegmentLike, XYObjectWritable } from '../types';
import { vectorInto } from './vector-into';

/**
 * b - a 벡터를 새 object로 반환한다.
 *
 * @param line 대상 segment
 */
export function vector(line: SegmentLike): XYObjectWritable {
  return vectorInto({ x: 0, y: 0 }, line);
}
