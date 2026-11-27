import { createZeroSegment } from '../internal/segment';
import type { Point, SegmentWritable } from '../types/flat-shapes.internal';
import { fromAngleInto } from './from-angle-into';

/**
 * origin에서 angle 방향으로 length 길이의 segment을 새 plain object로 반환한다.
 *
 * @param origin 시작점
 * @param angle 방향각(radian)
 * @param length 선분 길이. 0이면 zero-length segment을 반환한다
 */
export function fromAngle(origin: Point, angle: number, length: number): SegmentWritable {
  return fromAngleInto(createZeroSegment(), origin, angle, length);
}
