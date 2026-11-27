import type { InfiniteLine, Point, PointWritable } from '../types/flat-shapes.internal';
import { projectPointInto } from './project-point-into';

/**
 * `point`에서 infinite-line으로 내린 수선의 발을 새 plain object로 반환한다.
 *
 * degenerate infinite-line에서는 origin을 반환한다.
 */
export function projectPoint(line: InfiniteLine, point: Point): PointWritable {
  return projectPointInto({ x: 0, y: 0 }, line, point);
}
