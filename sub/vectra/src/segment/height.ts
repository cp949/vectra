import { readSegmentA, readSegmentB } from '../internal/segment';
import { readY } from '../internal/xy';
import type { SegmentLike } from '../types';

/**
 * segment endpoint AABB의 높이를 반환한다.
 *
 * @param line 높이를 계산할 segment
 */
export function height(line: SegmentLike): number {
  return Math.abs(readY(readSegmentB(line)) - readY(readSegmentA(line)));
}
