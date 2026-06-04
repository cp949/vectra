import type { SegmentLike, SegmentWritable } from '../types';
import { createSegment } from './create-segment';
import { reverseInto } from './reverse-into';

/**
 * 끝점 → a, 시작점 → b 순으로 교환한 새 plain object를 반환한다.
 *
 * @param line 반전할 segment
 */
export function reverse(line: SegmentLike): SegmentWritable {
  return reverseInto(createSegment(), line);
}
