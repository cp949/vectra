import type { Ray, RayWritable } from '../types/flat-shapes.internal';
import { reverseInto } from './reverse-into';

/**
 * `dx`, `dy`의 부호를 반전한 새 plain object를 반환한다.
 *
 * `reverseInto`에 위임하는 companion wrapper다.
 */
export function reverse(ray: Ray): RayWritable {
  return reverseInto({ ox: 0, oy: 0, dx: 0, dy: 0 }, ray);
}
