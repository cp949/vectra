import type { SegmentLike, XYObjectWritable } from '../types';
import { endInto } from './end-into';

/**
 * segment 끝점을 새 object로 반환한다.
 *
 * @param line 대상 segment
 */
export function end(line: SegmentLike): XYObjectWritable {
  return endInto({ x: 0, y: 0 }, line);
}
