import type { Segment, SegmentWritable, Point } from '../types/flat-shapes.internal';
import { centerOnInto } from './center-on-into';
import { createZeroSegment } from '../internal/segment';

/**
 * segment의 midpoint를 target point로 이동한 새 plain object를 반환한다.
 *
 * @param line 이동할 segment
 * @param target midpoint를 맞출 target point
 */
export function centerOn(line: Segment, target: Point): SegmentWritable {
  return centerOnInto(createZeroSegment(), line, target);
}
