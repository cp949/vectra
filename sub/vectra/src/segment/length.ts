import { hypot2 } from '../internal/numeric';
import type { Segment } from '../types/flat-shapes.internal';

/**
 * |b - a| 유한 line의 길이를 반환한다.
 *
 * @param line 대상 segment
 */
export function length(line: Segment): number {
  const dx = line.x2 - line.x1;
  const dy = line.y2 - line.y1;
  return hypot2(dx, dy);
}
