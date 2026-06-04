import type { RayLike, XYObjectWritable } from '../types';
import { pointAtTInto } from './point-at-t-into';

/**
 * `origin + direction * t` 위치를 새 plain object로 반환한다.
 *
 * `t`는 clamp하지 않는다. `t < 0`이면 backward supporting line 위치를 반환한다.
 * degenerate ray(direction length ≒ 0)에서는 `t`에 무관하게 origin을 반환한다.
 *
 * `pointAtTInto`에 위임하는 allocating companion이다.
 */
export function pointAtT(ray: RayLike, t: number): XYObjectWritable {
  return pointAtTInto({ x: 0, y: 0 }, ray, t);
}
