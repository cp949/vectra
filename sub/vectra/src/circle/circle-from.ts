import type { Circle, CircleWritable } from '../types/flat-shapes.internal';
import { copyInto } from './copy-into';
import { createZeroCircle } from '../internal/circle';

/**
 * `Circle` source의 center와 radius를 새 plain object로 복사해 반환한다.
 *
 * @param circle 복사할 source circle
 */
export function circleFrom(circle: Circle): CircleWritable {
  return copyInto(createZeroCircle(), circle);
}
