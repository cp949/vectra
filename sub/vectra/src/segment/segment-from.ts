import type { SegmentLike, SegmentWritable, XYInput } from '../types';
import { copyInto } from './copy-into';
import { createSegment } from './create-segment';

/**
 * `SegmentLike` source의 endpoint를 새 plain object로 복사해 반환한다.
 *
 * @param segment 복사할 source segment
 */
export function segmentFrom(segment: SegmentLike): SegmentWritable;
/**
 * 두 endpoint component로 새 plain segment writable을 만든다.
 */
export function segmentFrom(a: XYInput, b: XYInput): SegmentWritable;
export function segmentFrom(segmentOrA: SegmentLike | XYInput, b?: XYInput): SegmentWritable {
  if (b === undefined) {
    return copyInto(createSegment(), segmentOrA as SegmentLike);
  }
  return copyInto(createSegment(), segmentOrA as XYInput, b);
}
