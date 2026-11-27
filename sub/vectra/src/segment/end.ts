import type { Segment, PointWritable } from '../types/flat-shapes.internal';
import { endInto } from './end-into';

/**
 * segment 끝점을 새 object로 반환한다.
 *
 * @param line 대상 segment
 */
export function end(line: Segment): PointWritable {
  return endInto({ x: 0, y: 0 }, line);
}
