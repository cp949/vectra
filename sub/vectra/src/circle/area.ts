import { readCircleRadius } from '../internal/circle';
import type { CircleLike } from '../types';

/**
 * circle의 면적을 반환한다.
 *
 * radius <= 0인 empty circle은 0을 반환한다.
 *
 * @param circle 면적을 계산할 circle
 */
export function area(circle: CircleLike): number {
  const r = readCircleRadius(circle);
  if (r <= 0) return 0;
  return Math.PI * r * r;
}
