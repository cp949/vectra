import { createZeroSegment } from '../internal/segment';
import type { Segment, SegmentWritable } from '../types/flat-shapes.internal';
import { copyInto } from './copy-into';

/**
 * 두 끝점을 복사한 새 선분을 반환한다.
 *
 * @param segment 복사할 선분
 */
export function segmentFrom(segment: Segment): SegmentWritable {
  return copyInto(createZeroSegment(), segment);
}
