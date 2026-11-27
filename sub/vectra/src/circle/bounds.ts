import { createZeroBounds } from '../internal/bounds';
import type { BoundsWritable, Circle } from '../types/flat-shapes.internal';
import { boundsInto } from './bounds-into';

/**
 * circle을 포함하는 axis-aligned bounds를 새 plain object로 반환한다.
 *
 * radius <= 0인 empty circle은 sentinel empty bounds를 반환한다.
 * non-finite 좌표와 radius는 별도 검증하지 않고 boundsInto 산술 결과를 따른다.
 *
 * @param circle bounds로 변환할 circle
 */
export function bounds(circle: Circle): BoundsWritable {
  return boundsInto(createZeroBounds(), circle);
}
