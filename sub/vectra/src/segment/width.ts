import type { Segment } from '../types/flat-shapes.internal';

/**
 * segment endpoint AABB의 폭을 반환한다.
 *
 * @param line 폭을 계산할 segment
 */
export function width(line: Segment): number {
  return Math.abs(line.x2 - line.x1);
}
