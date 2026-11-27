import type { Circle } from '../types/flat-shapes.internal';

/**
 * circle의 면적을 반환한다.
 *
 * radius <= 0인 empty circle은 0을 반환한다.
 *
 * @param circle 면적을 계산할 circle
 */
export function area(circle: Circle): number {
  const r = circle.r;
  if (r <= 0) return 0;
  return Math.PI * r * r;
}
