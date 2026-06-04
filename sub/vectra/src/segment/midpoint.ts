import type { SegmentLike, XYObjectWritable } from '../types';
import { midpointInto } from './midpoint-into';

/**
 * (a + b) / 2 중점을 새 object로 반환한다.
 *
 * @param line 대상 segment
 */
export function midpoint(line: SegmentLike): XYObjectWritable {
  return midpointInto({ x: 0, y: 0 }, line);
}
