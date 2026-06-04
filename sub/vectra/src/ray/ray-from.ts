import type { RayLike, RayWritable, XYInput } from '../types';
import { copyInto } from './copy-into';
import { createRay } from './create-ray';

/**
 * `RayLike` source의 component를 새 plain object로 복사해 반환한다.
 *
 * direction은 normalize하지 않는다.
 *
 * @param ray 복사할 source ray
 */
export function rayFrom(ray: RayLike): RayWritable;
/**
 * origin과 direction component로 새 plain ray writable을 만든다.
 *
 * direction은 normalize하지 않는다.
 */
export function rayFrom(origin: XYInput, direction: XYInput): RayWritable;
export function rayFrom(rayOrOrigin: RayLike | XYInput, direction?: XYInput): RayWritable {
  if (direction === undefined) {
    return copyInto(createRay(), rayOrOrigin as RayLike);
  }
  // `(origin, direction)` overload: synthetic `RayLike`를 만들어 single-source copy로 위임한다
  return copyInto(createRay(), { origin: rayOrOrigin as XYInput, direction });
}
