import type { InfiniteLine, PointWritable } from '../types/flat-shapes.internal';
import { originInto } from './origin-into';

/** infinite-line의 origin point를 새 plain object로 반환한다. */
export function origin(line: InfiniteLine): PointWritable {
  return originInto({ x: 0, y: 0 }, line);
}
