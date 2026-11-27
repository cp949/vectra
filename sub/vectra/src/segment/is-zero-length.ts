import { segmentIsZeroLength } from '../internal/segment';
import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Segment } from '../types/flat-shapes.internal';

/**
 * lengthSq <= epsilon * epsilon이면 degenerate(zero-length) segment로 판정한다.
 *
 * @param line 판정할 segment
 * @param epsilon 판정 임계값. 기본값은 DEFAULT_EPSILON
 */
export function isZeroLength(line: Segment, epsilon: number = DEFAULT_EPSILON): boolean {
  return segmentIsZeroLength(line, epsilon);
}
