import type { SegmentLike, XYObjectWritable } from '../types';
import { startInto } from './start-into';

/**
 * segment 시작점을 새 object로 반환한다.
 *
 * @param line 대상 segment
 */
export function start(line: SegmentLike): XYObjectWritable {
  return startInto({ x: 0, y: 0 }, line);
}
