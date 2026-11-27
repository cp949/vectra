import type { Segment, SegmentWritable } from '../types/flat-shapes.internal';
import { createZeroSegment } from '../internal/segment';
import { reverseInto } from './reverse-into';

/**
 * 끝점 → a, 시작점 → b 순으로 교환한 새 plain object를 반환한다.
 *
 * @param line 반전할 segment
 */
export function reverse(line: Segment): SegmentWritable {
  return reverseInto(createZeroSegment(), line);
}
