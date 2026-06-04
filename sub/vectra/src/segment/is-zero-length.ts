import { DEFAULT_EPSILON } from '../internal/numeric';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { SegmentLike } from '../types';

/**
 * lengthSq <= epsilon * epsilon이면 degenerate(zero-length) segment로 판정한다.
 *
 * @param line 판정할 segment
 * @param epsilon 판정 임계값. 기본값은 DEFAULT_EPSILON
 */
export function isZeroLength(line: SegmentLike, epsilon: number = DEFAULT_EPSILON): boolean {
  const dx = readX(readSegmentB(line)) - readX(readSegmentA(line));
  const dy = readY(readSegmentB(line)) - readY(readSegmentA(line));
  return dx * dx + dy * dy <= epsilon * epsilon;
}
