import type { RayLike, XYObjectWritable } from '../types';
import { originInto } from './origin-into';

/**
 * ray의 origin point를 새 plain object로 반환한다.
 *
 * `originInto`에 위임하는 companion wrapper다.
 */
export function origin(ray: RayLike): XYObjectWritable {
  return originInto({ x: 0, y: 0 }, ray);
}
