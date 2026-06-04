import type { InfiniteLineLike, XYInput, XYObjectWritable } from '../types';
import { projectPointInto } from './project-point-into';

/**
 * `point`에서 infinite-line으로 내린 수선의 발을 새 plain object로 반환한다.
 *
 * degenerate infinite-line에서는 origin을 반환한다.
 */
export function projectPoint(line: InfiniteLineLike, point: XYInput): XYObjectWritable {
  return projectPointInto({ x: 0, y: 0 }, line, point);
}
