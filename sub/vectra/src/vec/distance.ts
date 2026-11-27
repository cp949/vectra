import type { Point } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * a와 b 사이 Euclidean 거리를 반환한다.
 *
 * @param a 거리를 측정할 첫 번째 점
 * @param b 거리를 측정할 두 번째 점
 */
export function distance(a: Point, b: Point): number {
  return hypot2(b.x - a.x, b.y - a.y);
}
