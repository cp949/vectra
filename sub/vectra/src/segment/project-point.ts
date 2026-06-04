import type { SegmentLike, XYInput, XYObjectWritable } from '../types';
import { projectPointInto } from './project-point-into';

/**
 * unclamped t로 계산한 projection point를 새 object로 반환한다. zero-length segment는 시작점을 반환한다.
 *
 * @param line projection을 계산할 segment
 * @param point segment에 투영할 point
 */
export function projectPoint(line: SegmentLike, point: XYInput): XYObjectWritable {
  return projectPointInto({ x: 0, y: 0 }, line, point);
}
