import type { Segment } from '../types/flat-shapes.internal';

/**
 * segment endpoint AABB의 높이를 반환한다.
 *
 * @param line 높이를 계산할 segment
 */
export function height(line: Segment): number {
  return Math.abs(line.y2 - line.y1);
}
