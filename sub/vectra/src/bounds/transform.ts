import { createZeroBounds } from '../internal/bounds';
import type { Bounds, BoundsWritable, Matrix } from '../types/flat-shapes.internal';
import { transformInto } from './transform-into';

/**
 * bounds의 네 corner를 matrix로 변환한 AABB를 새 plain object로 반환한다.
 *
 *
 * degenerate/empty 입력 처리 정책은 `transformInto`와 동일하다.
 * @param bounds 변환할 bounds
 * @param matrix bounds corner에 적용할 matrix
 */
export function transform(bounds: Bounds, matrix: Matrix): BoundsWritable {
  return transformInto(createZeroBounds(), bounds, matrix);
}
