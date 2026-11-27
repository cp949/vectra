import type { Ray, PointWritable } from '../types/flat-shapes.internal';
import { originInto } from './origin-into';

/**
 * ray의 origin point를 새 plain object로 반환한다.
 *
 * `originInto`에 위임하는 companion wrapper다.
 */
export function origin(ray: Ray): PointWritable {
  return originInto({ x: 0, y: 0 }, ray);
}
