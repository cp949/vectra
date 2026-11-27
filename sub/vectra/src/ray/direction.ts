import type { Ray, PointWritable } from '../types/flat-shapes.internal';
import { directionInto } from './direction-into';

/**
 * ray의 direction vector를 새 plain object로 반환한다.
 *
 * `directionInto`에 위임하는 companion wrapper다.
 */
export function direction(ray: Ray): PointWritable {
  return directionInto({ x: 0, y: 0 }, ray);
}
