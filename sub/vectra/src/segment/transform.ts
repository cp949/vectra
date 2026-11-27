import type { Matrix, Segment, SegmentWritable } from '../types/flat-shapes.internal';
import { createZeroSegment } from '../internal/segment';
import { transformInto } from './transform-into';

/**
 * segment의 두 endpoint에 matrix transform을 적용한 새 plain object를 반환한다.
 *
 * @param line 변환할 segment
 * @param matrix 적용할 matrix
 */
export function transform(line: Segment, matrix: Matrix): SegmentWritable {
  return transformInto(createZeroSegment(), line, matrix);
}
