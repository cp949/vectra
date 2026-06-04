import type { SegmentLike, XYObjectWritable } from '../types';
import { pointAtTInto } from './point-at-t-into';

/**
 * a + t * (b - a) 위치를 unclamped로 새 object로 반환한다.
 *
 * @param line 위치를 계산할 segment
 * @param t parametric 위치. [0, 1] 밖의 값도 clamp 없이 그대로 계산한다
 */
export function pointAtT(line: SegmentLike, t: number): XYObjectWritable {
  return pointAtTInto({ x: 0, y: 0 }, line, t);
}
