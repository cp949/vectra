import type { SegmentLike, XYInput, XYObjectWritable } from '../types';
import { closestPointInto } from './closest-point-into';

/**
 * t를 [0, 1]로 clamp한 closest point를 새 object로 반환한다. zero-length segment는 시작점을 반환한다.
 *
 * @param line 대상 segment
 * @param point closest point를 측정할 기준 point
 */
export function closestPoint(line: SegmentLike, point: XYInput): XYObjectWritable {
  return closestPointInto({ x: 0, y: 0 }, line, point);
}
