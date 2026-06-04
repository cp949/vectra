import type { InfiniteLineLike, XYObjectWritable } from '../types';
import { originInto } from './origin-into';

/** infinite-line의 origin point를 새 plain object로 반환한다. */
export function origin(line: InfiniteLineLike): XYObjectWritable {
  return originInto({ x: 0, y: 0 }, line);
}
