import type { RayLike, XYObjectWritable } from '../types';
import { directionInto } from './direction-into';

/**
 * ray의 direction vector를 새 plain object로 반환한다.
 *
 * `directionInto`에 위임하는 companion wrapper다.
 */
export function direction(ray: RayLike): XYObjectWritable {
  return directionInto({ x: 0, y: 0 }, ray);
}
