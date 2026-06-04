import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { SegmentLike } from '../types';

/**
 * |b - a|² 유한 line 길이의 제곱을 반환한다.
 *
 * @param line 대상 segment
 */
export function lengthSq(line: SegmentLike): number {
  const dx = readX(readSegmentB(line)) - readX(readSegmentA(line));
  const dy = readY(readSegmentB(line)) - readY(readSegmentA(line));
  return dx * dx + dy * dy;
}
