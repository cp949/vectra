import type { PointWritable, Segment } from '../types/flat-shapes.internal';
import { midpointInto } from './midpoint-into';

/**
 * (a + b) / 2 중점을 새 object로 반환한다.
 *
 * @param line 대상 segment
 */
export function midpoint(line: Segment): PointWritable {
  return midpointInto({ x: 0, y: 0 }, line);
}
