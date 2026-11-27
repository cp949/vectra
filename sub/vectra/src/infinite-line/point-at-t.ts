import type { InfiniteLine, PointWritable } from '../types/flat-shapes.internal';
import { pointAtTInto } from './point-at-t-into';

/**
 * `origin + direction * t` 위치를 새 plain object로 반환한다.
 *
 * `t`는 clamp하지 않는다. degenerate infinite-line에서는 origin을 반환한다.
 */
export function pointAtT(line: InfiniteLine, t: number): PointWritable {
  return pointAtTInto({ x: 0, y: 0 }, line, t);
}
