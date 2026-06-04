import type { SegmentLike, SegmentWritable, XYInput } from '../types';
import { centerOnInto } from './center-on-into';
import { createSegment } from './create-segment';

/**
 * segment의 midpoint를 target point로 이동한 새 plain object를 반환한다.
 *
 * @param line 이동할 segment
 * @param target midpoint를 맞출 target point
 */
export function centerOn(line: SegmentLike, target: XYInput): SegmentWritable {
  return centerOnInto(createSegment(), line, target);
}
