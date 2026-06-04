import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { SegmentLike } from '../types';

/**
 * |b - a| 유한 line의 길이를 반환한다.
 *
 * @param line 대상 segment
 */
export function length(line: SegmentLike): number {
  const dx = readX(readSegmentB(line)) - readX(readSegmentA(line));
  const dy = readY(readSegmentB(line)) - readY(readSegmentA(line));
  return Math.hypot(dx, dy);
}
