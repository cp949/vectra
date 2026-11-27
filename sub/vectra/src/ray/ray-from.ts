import type { Ray, RayWritable } from '../types/flat-shapes.internal';
import { copyInto } from './copy-into';
import { createRay } from './create-ray';

/**
 * `Ray` source의 component를 새 plain object로 복사해 반환한다.
 *
 * direction은 normalize하지 않는다.
 *
 * @param ray 복사할 source ray
 */
export function rayFrom(ray: Ray): RayWritable {
  return copyInto(createRay(), ray);
}
