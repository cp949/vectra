import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { SegmentLike } from '../types';

/**
 * segment a→b 방향의 left normal 방향각을 radian으로 반환한다. angle(line) + π/2와 같다.
 * zero-length에서는 π/2를 반환한다.
 *
 * @param line 법선 각도를 계산할 segment
 */
export function normalAngle(line: SegmentLike): number {
  const ax = readX(readSegmentA(line));
  const ay = readY(readSegmentA(line));
  const bx = readX(readSegmentB(line));
  const by = readY(readSegmentB(line));
  return Math.atan2(by - ay, bx - ax) + Math.PI / 2;
}
