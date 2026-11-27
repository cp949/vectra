import { createZeroTriangle } from '../internal/triangle';
import type { Triangle, TriangleWritable } from '../types/flat-shapes.internal';
import { copyInto } from './copy-into';

/**
 * copyInto의 allocating companion. triangle을 새 객체로 복사한다.
 *
 * @param triangle 복사할 triangle
 */
export function triangleFrom(triangle: Triangle): TriangleWritable {
  return copyInto(createZeroTriangle(), triangle);
}
