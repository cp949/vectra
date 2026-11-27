import type { Segment, SegmentWritable } from '../types/flat-shapes.internal';
import { createZeroSegment } from '../internal/segment';
import { rotateInto } from './rotate-into';

/**
 * segment를 원점 기준으로 CCW 회전한 새 plain object를 반환한다.
 *
 * @param line 회전할 segment
 * @param angle 회전각(radian, CCW)
 */
export function rotate(line: Segment, angle: number): SegmentWritable {
  return rotateInto(createZeroSegment(), line, angle);
}
