import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX } from '../internal/xy';
import type { SegmentLike } from '../types';

/**
 * segment endpoint AABB의 폭을 반환한다.
 *
 * @param line 폭을 계산할 segment
 */
export function width(line: SegmentLike): number {
  return Math.abs(readX(readSegmentB(line)) - readX(readSegmentA(line)));
}
