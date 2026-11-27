import type { Segment, PointWritable } from '../types/flat-shapes.internal';
import { pointAtTInto } from './point-at-t-into';

/**
 * 시작점 + t * (끝점 - 시작점) 위치를 unclamped로 새 object로 반환한다.
 *
 * @param line 위치를 계산할 segment
 * @param t parametric 위치. [0, 1] 밖의 값도 clamp 없이 그대로 계산한다
 */
export function pointAtT(line: Segment, t: number): PointWritable {
  return pointAtTInto({ x: 0, y: 0 }, line, t);
}
