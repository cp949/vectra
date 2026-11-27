import type { Segment } from '../types/flat-shapes.internal';

/**
 * segment의 a→b 방향벡터 각도를 radian으로 반환한다. zero-length에서는 0을 반환한다.
 *
 * @param line 각도를 계산할 segment
 */
export function angle(line: Segment): number {
  const ax = line.x1;
  const ay = line.y1;
  const bx = line.x2;
  const by = line.y2;
  // zero-length일 때 Math.atan2(0, 0)은 자연스럽게 0을 반환한다
  return Math.atan2(by - ay, bx - ax);
}
