import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { SegmentLike } from '../types';

/**
 * segment의 a→b 방향벡터 각도를 radian으로 반환한다. zero-length에서는 0을 반환한다.
 *
 * @param line 각도를 계산할 segment
 */
export function angle(line: SegmentLike): number {
  const ax = readX(readSegmentA(line));
  const ay = readY(readSegmentA(line));
  const bx = readX(readSegmentB(line));
  const by = readY(readSegmentB(line));
  // zero-length일 때 Math.atan2(0, 0)은 자연스럽게 0을 반환한다
  return Math.atan2(by - ay, bx - ax);
}
