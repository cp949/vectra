import { createRect } from '../rect/create-rect';
import type { MatrixLike, RectLike, RectWritable } from '../types';
import { transformRectInto } from './transform-rect-into';

/**
 * rect의 네 corner를 matrix로 변환한 AABB rect를 새 plain rect로 반환한다.
 *
 * empty/degenerate rect도 특별 처리 없이 네 corner를 변환해 axis-aligned rect로 감싼다.
 *
 * @param matrix rect corner에 적용할 matrix
 * @param rect 변환할 rect
 */
export function transformRect(matrix: MatrixLike, rect: RectLike): RectWritable {
  return transformRectInto(createRect(), matrix, rect);
}
