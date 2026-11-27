import type { Segment } from '../types/flat-shapes.internal';

/**
 * |b - a|² 유한 line 길이의 제곱을 반환한다.
 *
 * @param line 대상 segment
 */
export function lengthSq(line: Segment): number {
  const dx = line.x2 - line.x1;
  const dy = line.y2 - line.y1;
  return dx * dx + dy * dy;
}
