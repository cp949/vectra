import type { Circle } from '../types/flat-shapes.internal';

/**
 * circle의 둘레 길이를 반환한다.
 *
 * radius <= 0인 empty circle은 0을 반환한다.
 *
 * @param circle 둘레 길이를 계산할 circle
 */
export function circumference(circle: Circle): number {
  const r = circle.r;
  if (r <= 0) return 0;
  return 2 * Math.PI * r;
}
