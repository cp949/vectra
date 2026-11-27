import type { Segment, Point, PointWritable } from '../types/flat-shapes.internal';
import { projectPointInto } from './project-point-into';

/**
 * unclamped t로 계산한 projection point를 새 object로 반환한다. zero-length segment는 시작점을 반환한다.
 *
 * @param line projection을 계산할 segment
 * @param point segment에 투영할 point
 */
export function projectPoint(line: Segment, point: Point): PointWritable {
  return projectPointInto({ x: 0, y: 0 }, line, point);
}
