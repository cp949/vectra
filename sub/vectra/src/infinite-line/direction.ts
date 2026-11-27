import type { InfiniteLine, PointWritable } from '../types/flat-shapes.internal';
import { directionInto } from './direction-into';

/** infinite-line의 direction vector를 새 plain object로 반환한다. */
export function direction(line: InfiniteLine): PointWritable {
  return directionInto({ x: 0, y: 0 }, line);
}
