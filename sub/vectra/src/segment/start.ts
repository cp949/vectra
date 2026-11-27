import type { PointWritable, Segment } from '../types/flat-shapes.internal';
import { startInto } from './start-into';

/**
 * segment 시작점을 새 object로 반환한다.
 *
 * @param line 대상 segment
 */
export function start(line: Segment): PointWritable {
  return startInto({ x: 0, y: 0 }, line);
}
