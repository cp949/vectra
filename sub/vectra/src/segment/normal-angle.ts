import type { Segment } from '../types/flat-shapes.internal';

/**
 * segment a→b 방향의 left normal 방향각을 radian으로 반환한다. angle(line) + π/2와 같다.
 * zero-length에서는 π/2를 반환한다.
 *
 * @param line 법선 각도를 계산할 segment
 */
export function normalAngle(line: Segment): number {
  const ax = line.x1;
  const ay = line.y1;
  const bx = line.x2;
  const by = line.y2;
  return Math.atan2(by - ay, bx - ax) + Math.PI / 2;
}
