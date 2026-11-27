import type { Segment, Point, PointWritable } from '../types/flat-shapes.internal';
import { closestPointInto } from './closest-point-into';

/**
 * t를 [0, 1]로 clamp한 closest point를 새 object로 반환한다. zero-length segment는 시작점을 반환한다.
 *
 * @param line 대상 segment
 * @param point closest point를 측정할 기준 point
 */
export function closestPoint(line: Segment, point: Point): PointWritable {
  return closestPointInto({ x: 0, y: 0 }, line, point);
}
