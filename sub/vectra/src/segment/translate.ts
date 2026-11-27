import type { Point, Segment, SegmentWritable } from '../types/flat-shapes.internal';
import { createZeroSegment } from '../internal/segment';
import { translateInto } from './translate-into';

/**
 * segment의 모든 endpoint에 offset을 더한 새 plain object를 반환한다.
 *
 * @param line 이동할 segment
 * @param offset 이동 벡터
 */
export function translate(line: Segment, offset: Point): SegmentWritable {
  return translateInto(createZeroSegment(), line, offset);
}
