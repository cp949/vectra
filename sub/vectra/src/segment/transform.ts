import type { MatrixLike, SegmentLike, SegmentWritable } from '../types';
import { createSegment } from './create-segment';
import { transformInto } from './transform-into';

/**
 * segment의 두 endpoint에 matrix transform을 적용한 새 plain object를 반환한다.
 *
 * @param line 변환할 segment
 * @param matrix 적용할 matrix
 */
export function transform(line: SegmentLike, matrix: MatrixLike): SegmentWritable {
  return transformInto(createSegment(), line, matrix);
}
