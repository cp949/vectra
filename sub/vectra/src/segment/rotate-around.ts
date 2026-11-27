import type { Segment, SegmentWritable, Point } from '../types/flat-shapes.internal';
import { createZeroSegment } from '../internal/segment';
import { rotateAroundInto } from './rotate-around-into';

/**
 * segment을 center 기준으로 CCW 회전한 새 plain object를 반환한다.
 *
 * @param line 회전할 segment
 * @param center 회전 중심점
 * @param angle 회전각(radian, CCW)
 */
export function rotateAround(line: Segment, center: Point, angle: number): SegmentWritable {
  return rotateAroundInto(createZeroSegment(), line, center, angle);
}
