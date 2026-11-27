import type { PointWritable, Segment } from '../types/flat-shapes.internal';
import { vectorInto } from './vector-into';

/**
 * b - a 벡터를 새 object로 반환한다.
 *
 * @param line 대상 segment
 */
export function vector(line: Segment): PointWritable {
  return vectorInto({ x: 0, y: 0 }, line);
}
