import type { SegmentLike, SegmentWritable } from '../types';
import { createSegment } from './create-segment';
import { rotateInto } from './rotate-into';

/**
 * segment를 원점 기준으로 CCW 회전한 새 plain object를 반환한다.
 *
 * @param line 회전할 segment
 * @param angle 회전각(radian, CCW)
 */
export function rotate(line: SegmentLike, angle: number): SegmentWritable {
  return rotateInto(createSegment(), line, angle);
}
